package com.backend.sesim.domain.terraform.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@Service
public class TerraformTemplateService {

    /**
     * provider.tf 파일 템플릿을 생성합니다.
     */
    public String createProviderTemplate() {
        return """
    provider \"aws\" {
      region     = var.aws_region
      access_key = var.access_key
      secret_key = var.secret_key
      token      = var.session_token
    }
    """;
    }

    /**
     * variables.tf 파일 템플릿을 생성합니다.
     */
    public String createVariablesTemplate() {
        return """
        variable "aws_region" {
          type = string
        }
        variable "instance_type" {
          type = string
        }
        variable "ami_id" {
          type = string
        }
        variable "custom_iam_role_name" {
          type        = string
          description = "사용자가 입력한 IAM Role 이름"
        }
        variable "access_key" { type = string }
        variable "secret_key" { type = string }
        variable "session_token" { type = string }
        """;
    }

    /**
     * vpc.tf 파일 템플릿을 생성합니다.
     */
    public String createVpcTemplate(String deploymentId) {
        return String.format("""
        resource "aws_vpc" "customer_vpc" {
          cidr_block           = "10.10.0.0/16"
          enable_dns_support   = true
          enable_dns_hostnames = true

          tags = {
            Name = "customer-vpc-%s"
            DeploymentId = "%s"
          }
        }

        resource "aws_subnet" "customer_subnet_a" {
          vpc_id                  = aws_vpc.customer_vpc.id
          cidr_block              = "10.10.11.0/24"
          availability_zone       = "${var.aws_region}a"
          map_public_ip_on_launch = true

          tags = {
            Name = "subnet-a-%s"
            DeploymentId = "%s"
          }
        }

        resource "aws_subnet" "customer_subnet_c" {
          vpc_id                  = aws_vpc.customer_vpc.id
          cidr_block              = "10.10.12.0/24"
          availability_zone       = "${var.aws_region}c"
          map_public_ip_on_launch = true

          tags = {
            Name = "subnet-c-%s"
            DeploymentId = "%s"
          }
        }

        resource "aws_internet_gateway" "igw" {
          vpc_id = aws_vpc.customer_vpc.id
          
          tags = {
            Name = "igw-%s"
            DeploymentId = "%s"
          }
        }

        resource "aws_route_table" "public_rt" {
          vpc_id = aws_vpc.customer_vpc.id

          route {
            cidr_block = "0.0.0.0/0"
            gateway_id = aws_internet_gateway.igw.id
          }
          
          tags = {
            Name = "public-rt-%s"
            DeploymentId = "%s"
          }
        }

        resource "aws_route_table_association" "rt_assoc_a" {
          subnet_id      = aws_subnet.customer_subnet_a.id
          route_table_id = aws_route_table.public_rt.id
        }

        resource "aws_route_table_association" "rt_assoc_c" {
          subnet_id      = aws_subnet.customer_subnet_c.id
          route_table_id = aws_route_table.public_rt.id
        }
        """, deploymentId, deploymentId, deploymentId, deploymentId,
                deploymentId, deploymentId, deploymentId, deploymentId,
                deploymentId, deploymentId);
    }

    /**
     * ec2.tf 파일 템플릿을 생성합니다.
     */
    public String createEc2Template(String deploymentId) {
        return String.format("""
        resource "aws_security_group" "client_sg" {
          name        = "client-node-sg-%s"
          description = "Allow SSH, NodePort"
          vpc_id      = aws_vpc.customer_vpc.id

          ingress {
            from_port   = 22
            to_port     = 22
            protocol    = "tcp"
            cidr_blocks = ["0.0.0.0/0"]
          }

          ingress {
            from_port   = 30000
            to_port     = 32767
            protocol    = "tcp"
            cidr_blocks = ["0.0.0.0/0"]
          }

          egress {
            from_port   = 0
            to_port     = 0
            protocol    = "-1"
            cidr_blocks = ["0.0.0.0/0"]
          }

          tags = {
            Name = "client-sg-%s"
            DeploymentId = "%s"
          }
        }

        resource "aws_instance" "client_nodes" {
          count         = 2
          ami           = var.ami_id
          instance_type = var.instance_type
          key_name      = aws_key_pair.client_keypair.key_name
          iam_instance_profile = aws_iam_instance_profile.ec2_instance_profile.name

          subnet_id = [
            aws_subnet.customer_subnet_a.id,
            aws_subnet.customer_subnet_c.id
          ][count.index]

          vpc_security_group_ids      = [aws_security_group.client_sg.id]
          associate_public_ip_address = true

          tags = {
            Name = "client-node-${count.index + 1}-%s"
            DeploymentId = "%s"
          }
        }
        """, deploymentId, deploymentId, deploymentId, deploymentId, deploymentId);
    }

    /**
     * iam.tf 파일 템플릿을 생성합니다.
     */
    public String createIamTemplate(String deploymentId) {
        return String.format("""
        resource "aws_iam_role" "ec2_role" {
          name = "client-ec2-role-%s"

          assume_role_policy = jsonencode({
            Version = "2012-10-17"
            Statement = [
              {
                Effect = "Allow"
                Principal = {
                  Service = "ec2.amazonaws.com"
                }
                Action = "sts:AssumeRole"
              }
            ]
          })
          
          tags = {
            DeploymentId = "%s"
          }
        }

        resource "aws_iam_policy" "basic_policy" {
          name        = "client-basic-policy-%s"
          description = "Basic policy for EC2 instance"
          policy = jsonencode({
            Version = "2012-10-17"
            Statement = [
              {
                Effect   = "Allow"
                Action   = [
                  "logs:CreateLogGroup",
                  "logs:CreateLogStream",
                  "logs:PutLogEvents"
                ]
                Resource = "*"
              }
            ]
          })
          
          tags = {
            DeploymentId = "%s"
          }
        }

        resource "aws_iam_role_policy_attachment" "attach_policy" {
          role       = aws_iam_role.ec2_role.name
          policy_arn = aws_iam_policy.basic_policy.arn
        }

        resource "aws_iam_instance_profile" "ec2_instance_profile" {
          name = "client-ec2-profile-%s"
          role = aws_iam_role.ec2_role.name
        }
        """, deploymentId, deploymentId, deploymentId, deploymentId, deploymentId);
    }

    /**
     * keypair.tf 파일 템플릿을 생성합니다.
     */
    public String createKeypairTemplate(String deploymentId) {
        return String.format("""
        resource "tls_private_key" "client_key" {
          algorithm = "RSA"
          rsa_bits  = 4096
        }

        resource "aws_key_pair" "client_keypair" {
          key_name   = "client-key-%s"
          public_key = tls_private_key.client_key.public_key_openssh
          
          tags = {
            DeploymentId = "%s"
          }
        }

        resource "local_file" "pem_file" {
          filename        = "${path.module}/client-key-%s.pem"
          content         = tls_private_key.client_key.private_key_pem
          file_permission = "0400"
        }
        """, deploymentId, deploymentId, deploymentId);
    }

    /**
     * outputs.tf 파일 템플릿을 생성합니다.
     */
    public String createOutputsTemplate() {
        return """
        output "ec2_public_ips" {
          value = aws_instance.client_nodes[*].public_ip
        }

        output "pem_file_path" {
          value = local_file.pem_file.filename
        }

        output "key_name" {
          value = aws_key_pair.client_keypair.key_name
        }

        output "iam_instance_profile" {
          value = aws_iam_instance_profile.ec2_instance_profile.name
        }
        """;
    }

    /**
     * terraform.tfvars 파일 템플릿을 생성합니다.
     */
    public String createTfvarsTemplate(String region, String instanceType, String amiId, String iamRoleName,
                                       String accessKey, String secretKey, String sessionToken) {
        return String.format("""
    aws_region    = \"%s\"
    instance_type = \"%s\"
    ami_id        = \"%s\"
    custom_iam_role_name = \"%s\"
    access_key = \"%s\"
    secret_key = \"%s\"
    session_token = \"%s\"
    """, region, instanceType, amiId, iamRoleName, accessKey, secretKey, sessionToken);
    }


    /**
     * 모든 Terraform 파일을 지정된 디렉토리에 생성합니다.
     *
     * @param workspacePath 작업 경로
     * @param deploymentId 배포 ID
     * @param region AWS 리전
     * @param instanceType EC2 인스턴스 타입
     * @param amiId AMI ID
     * @param iamRoleName IAM 역할 이름
     * @param accessKey AWS 액세스 키
     * @param secretKey AWS 시크릿 키
     * @param sessionToken AWS 세션 토큰
     * @throws IOException 파일 생성 중 오류 발생 시
     */
    public void createTerraformFiles(String workspacePath, String deploymentId,
                                     String region, String instanceType,
                                     String amiId, String iamRoleName,
                                     String accessKey, String secretKey, String sessionToken) throws IOException {
        try {
            // 디렉토리 생성
            Path workspaceDir = Paths.get(workspacePath);
            Files.createDirectories(workspaceDir);

            // Terraform 파일 생성
            Files.writeString(workspaceDir.resolve("provider.tf"), createProviderTemplate());
            Files.writeString(workspaceDir.resolve("variables.tf"), createVariablesTemplate());
            Files.writeString(workspaceDir.resolve("vpc.tf"), createVpcTemplate(deploymentId));
            Files.writeString(workspaceDir.resolve("ec2.tf"), createEc2Template(deploymentId));
            Files.writeString(workspaceDir.resolve("iam.tf"), createIamTemplate(deploymentId));
            Files.writeString(workspaceDir.resolve("keypair.tf"), createKeypairTemplate(deploymentId));
            Files.writeString(workspaceDir.resolve("outputs.tf"), createOutputsTemplate());
            Files.writeString(workspaceDir.resolve("terraform.tfvars"),
                    createTfvarsTemplate(region, instanceType, amiId, iamRoleName, accessKey, secretKey, sessionToken));

            log.info("Created Terraform files in directory: {}", workspacePath);
        } catch (IOException e) {
            log.error("Terraform 파일 생성 실패: {}", e.getMessage());
            throw e;
        }
    }
}