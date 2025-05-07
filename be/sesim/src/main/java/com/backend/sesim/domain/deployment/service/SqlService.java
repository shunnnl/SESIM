package com.backend.sesim.domain.deployment.service;

import java.io.File;
import java.io.IOException;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.sesim.domain.deployment.entity.Project;
import com.backend.sesim.domain.deployment.entity.ProjectModelInformation;
import com.backend.sesim.domain.deployment.exception.TerraformErrorCode;
import com.backend.sesim.domain.resourcemanagement.entity.Model;
import com.backend.sesim.domain.user.entity.User;
import com.backend.sesim.global.exception.GlobalException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class SqlService {

	@Transactional
	public File makeInitSql(Project project, List<ProjectModelInformation> projectModelInformations) {

		User user = project.getRoleArn().getUser();

		StringBuilder sb = new StringBuilder();

		sb.append("-- Users\n");
		sb.append(String.format("""
				INSERT INTO users (user_id, nickname, email, created_at)
				VALUES
				(%d, '%s', '%s', NOW())
				ON CONFLICT (user_id) DO NOTHING;
				
				""",
			user.getId(),
			user.getNickname(),
			user.getEmail()
		));

		sb.append("-- Projects\n");
		sb.append(String.format("""
				INSERT INTO projects (project_id, user_id, name, url, "desc")
				VALUES 
				(%d, %d, '%s', '%s', '%s')
				ON CONFLICT (project_id) DO NOTHING;
				
				""",
			project.getId(),
			user.getId(),
			project.getName(),
			project.getAlbAddress(),
			project.getDescription()
		));

		sb.append("-- Models\n");
		for (ProjectModelInformation info : projectModelInformations) {
			Model model = info.getModel();

			sb.append(String.format("""
					INSERT INTO models (model_id, project_id, name, api_key, dashboard, ec2_spec, ec2_info, created_at)
					VALUES (
					    %d,
					    %d,
					    '%s',
					    '%s',
					    '%s',
					    '%s',
					    '%s',
					    NOW()
					)
					ON CONFLICT (model_id) DO NOTHING;
					
					""",
				model.getId(),
				project.getId(),
				model.getName(),
				info.getModelApiKey(),
				".", // 대시보드 필드 (현재 고정)
				info.getSpec().getEc2Spec(),
				info.getSpec().getEc2Info()
			));
		}

		// 파일로 저장
		try {
			File file = File.createTempFile("init-", ".sql");
			try (var writer = new java.io.FileWriter(file)) {
				writer.write(sb.toString());
			}
			return file;
		} catch (IOException e) {
			log.error("init.sql 파일 생성 실패: {}", e.getMessage(), e);
			throw new GlobalException(TerraformErrorCode.SQL_CREATE_INIT);
		}
	}
}
