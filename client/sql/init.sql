
-- Users
INSERT INTO users (user_id, nickname, email, created_at)
VALUES
(1, '홍길동', 'hong@example.com', NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Projects
INSERT INTO projects (project_id, user_id, name, url, "desc")
VALUES
(1, 1, '보안 로그 분석 프로젝트', 'http://ec2-url', '보안 로그 기반 이상 탐지 시스템 개발')
ON CONFLICT (project_id) DO NOTHING;

-- Models
INSERT INTO models (model_id, project_id, name, api_key, dashboard, ec2_spec, ec2_info, created_at)
VALUES (
    1,
    1,
    '모델1',
    'test-api-key-123',
    '{"dashboard": "example"}',
    't3.medium',
    'ec2-3-38-222-111.ap-northeast-2.compute.amazonaws.com',
    NOW()
)
ON CONFLICT (model_id) DO NOTHING;
