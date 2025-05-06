package com.backend.sesim.domain.deployment.service;

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
     * SaaS 계정에 배포하기 위한 Terraform 파일을 생성합니다.
     */
    public void createSaasTerraformFiles(String workspacePath, String deploymentId,
                                         String customerId, String region,
                                         String amiId, String accessKey, String secretKey,
                                         String sessionToken) throws IOException {
        try {
            // 디렉토리 생성
            Path workspaceDir = Paths.get(workspacePath);
            Files.createDirectories(workspaceDir);

            // Terraform 파일 생성
            Files.writeString(workspaceDir.resolve("provider.tf"), createProviderTemplate());
            Files.writeString(workspaceDir.resolve("variables.tf"), createVariablesTemplate());
            Files.writeString(workspaceDir.resolve("vpc.tf"), createVpcTemplateWithCustomerId(deploymentId, customerId));
            Files.writeString(workspaceDir.resolve("ec2.tf"), createEc2TemplateWithCustomerId(deploymentId, customerId));
            Files.writeString(workspaceDir.resolve("iam.tf"), createIamTemplateWithCustomerId(deploymentId, customerId));
            Files.writeString(workspaceDir.resolve("keypair.tf"), createKeypairTemplateWithCustomerId(deploymentId, customerId));
            Files.writeString(workspaceDir.resolve("outputs.tf"), createOutputsTemplate());
            Files.writeString(workspaceDir.resolve("terraform.tfvars"),
                    createTfvarsTemplate(region, amiId, customerId, accessKey, secretKey, sessionToken));

            log.info("Created SaaS Terraform files in directory: {}", workspacePath);
        } catch (IOException e) {
            log.error("Terraform 파일 생성 실패: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * vpc.tf 파일 템플릿을 고객 ID 태그와 함께 생성합니다.
     */
    public String createVpcTemplateWithCustomerId(String deploymentId, String customerId) {
        return String.format("""
        resource "aws_vpc" "customer_vpc" {
          cidr_block           = "10.10.0.0/16"
          enable_dns_support   = true
          enable_dns_hostnames = true

          tags = {
            Name = "customer-vpc-%s"
            DeploymentId = "%s"
            CustomerId = "%s"
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
            CustomerId = "%s"
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
            CustomerId = "%s"
          }
        }

        resource "aws_internet_gateway" "igw" {
          vpc_id = aws_vpc.customer_vpc.id
          
          tags = {
            Name = "igw-%s"
            DeploymentId = "%s"
            CustomerId = "%s"
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
            CustomerId = "%s"
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
        """, deploymentId, deploymentId, customerId,
                deploymentId, deploymentId, customerId,
                deploymentId, deploymentId, customerId,
                deploymentId, deploymentId, customerId,
                deploymentId, deploymentId, customerId);
    }

    /**
     * ec2.tf 파일 템플릿을 고객 ID 태그와 함께 생성합니다.
     */
    public String createEc2TemplateWithCustomerId(String deploymentId, String customerId) {
        return String.format("""
    resource "aws_security_group" "client_sg" {
      name        = "client-node-sg-%s"
      description = "Allow required ports for customer access"
      vpc_id      = aws_vpc.customer_vpc.id

      // SSH 접근
      ingress {
        from_port   = 22
        to_port     = 22
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
      }

      // Kubernetes NodePort 범위
      ingress {
        from_port   = 30000
        to_port     = 32767
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
      }
      
      // Kubernetes API Server
      ingress {
        from_port   = 6443
        to_port     = 6443
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
      }
      
      // HTTPS
      ingress {
        from_port   = 443
        to_port     = 443
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
      }
      
      // HTTP
      ingress {
        from_port   = 80
        to_port     = 80
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
      }
      
      // 추가 포트: Kubelet API
      ingress {
        from_port   = 10250
        to_port     = 10250
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
      }
      
       // 추가 포트: 8080 (API 서버 비보안 포트) - 같은 보안그룹 내에서만 접근 가능
       ingress {
         from_port   = 8080
         to_port     = 8080
         protocol    = "tcp"
         self        = true 
       }
      
      // DNS (UDP)
      ingress {
        from_port   = 53
        to_port     = 53
        protocol    = "udp"
        cidr_blocks = ["0.0.0.0/0"]
      }
      
      // Flannel VXLAN (UDP)
      ingress {
        from_port   = 8472
        to_port     = 8472
        protocol    = "udp"
        cidr_blocks = ["0.0.0.0/0"]
      }
      
      // ICMP - 모든 타입
      ingress {
        from_port   = -1
        to_port     = -1
        protocol    = "icmp"
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
        CustomerId = "%s"
      }
    }

    resource "aws_instance" "client_nodes" {
      count         = 2
      ami           = var.ami_id
      instance_type = count.index == 0 ? "c5a.xlarge" : "c5a.large"
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
        CustomerId = "%s"
      }
    }
    """, deploymentId, deploymentId, deploymentId, customerId, deploymentId, deploymentId, customerId);
    }

    /**
     * iam.tf 파일 템플릿을 고객 ID 태그와 함께 생성합니다.
     */
    public String createIamTemplateWithCustomerId(String deploymentId, String customerId) {
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
        CustomerId = "%s"
      }
    }

    resource "aws_iam_policy" "customer_policy" {
      name        = "customer-specific-policy-%s"
      description = "Policy for customer specific resources"
      policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
          {
            Effect   = "Allow"
            Action   = [
              "logs:CreateLogGroup",
              "logs:CreateLogStream",
              "logs:PutLogEvents",
              "ec2:DescribeInstances",
              "ec2:DescribeAddresses",
              "ec2:DescribeNetworkInterfaces",
              "ec2:DescribeVpcs",
              "ec2:DescribeSubnets",
              "ec2:DescribeSecurityGroups"
            ]
            Resource = "*"
            Condition = {
              StringEquals = {
                "aws:ResourceTag/CustomerId": "%s"
              }
            }
          }
        ]
      })
      
      tags = {
        DeploymentId = "%s"
        CustomerId = "%s"
      }
    }

    resource "aws_iam_role_policy_attachment" "attach_customer_policy" {
      role       = aws_iam_role.ec2_role.name
      policy_arn = aws_iam_policy.customer_policy.arn
    }

    resource "aws_iam_role_policy_attachment" "attach_basic_policy" {
      role       = aws_iam_role.ec2_role.name
      policy_arn = aws_iam_policy.basic_policy.arn
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
              "logs:PutLogEvents",
              "ec2:DescribeInstances" 
            ]
            Resource = "*"
          }
        ]
      })
      
      tags = {
        DeploymentId = "%s"
        CustomerId = "%s"
      }
    }

    resource "aws_iam_instance_profile" "ec2_instance_profile" {
      name = "client-ec2-profile-%s"
      role = aws_iam_role.ec2_role.name
    }
    """, deploymentId, deploymentId, customerId,
                deploymentId, customerId, deploymentId, customerId,
                deploymentId, deploymentId, customerId, deploymentId);
    }

    /**
     * keypair.tf 파일 템플릿을 고객 ID 태그와 함께 생성합니다.
     */
    public String createKeypairTemplateWithCustomerId(String deploymentId, String customerId) {
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
            CustomerId = "%s"
          }
        }

        resource "local_file" "pem_file" {
          filename        = "${path.module}/client-key-%s.pem"
          content         = tls_private_key.client_key.private_key_pem
          file_permission = "0400"
        }
        """, deploymentId, deploymentId, customerId, deploymentId);
    }

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
    public String createTfvarsTemplate(String region, String amiId, String iamRoleName,
                                       String accessKey, String secretKey, String sessionToken) {
        return String.format("""
    aws_region    = \"%s\"
    ami_id        = \"%s\"
    custom_iam_role_name = \"%s\"
    access_key = \"%s\"
    secret_key = \"%s\"
    session_token = \"%s\"
    """, region, amiId, iamRoleName, accessKey, secretKey, sessionToken);
    }

}