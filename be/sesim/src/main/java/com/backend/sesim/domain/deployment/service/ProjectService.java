package com.backend.sesim.domain.deployment.service;

import com.backend.sesim.domain.auth.exception.AuthErrorCode;
import com.backend.sesim.domain.deployment.dto.response.ProjectListResponse;
import com.backend.sesim.domain.deployment.entity.Project;
import com.backend.sesim.domain.deployment.repository.ProjectRepository;
import com.backend.sesim.domain.iam.entity.RoleArn;
import com.backend.sesim.domain.iam.repository.RoleArnRepository;
import com.backend.sesim.domain.user.entity.User;
import com.backend.sesim.domain.user.repository.UserRepository;
import com.backend.sesim.global.exception.GlobalException;
import com.backend.sesim.global.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final RoleArnRepository roleArnRepository;
    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;

    /**
     * 현재 로그인한 사용자의 프로젝트 목록 조회
     */
    public ProjectListResponse getUserProjects() {
        // 현재 로그인한 사용자 ID 가져오기
        Long userId = securityUtils.getCurrentUsersId();

        // 사용자 정보 조회
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND));

        // 사용자의 RoleArn 목록 조회
        List<RoleArn> roleArns = roleArnRepository.findAllByUser(currentUser);

        // RoleArn에 해당하는 프로젝트 목록 조회
        List<Project> projects = projectRepository.findAllByRoleArnIn(roleArns);

        // 응답 DTO 변환
        return ProjectListResponse.from(projects);
    }
}