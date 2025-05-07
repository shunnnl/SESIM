-- Users
INSERT INTO users (user_id, nickname, email, created_at)
VALUES (1, '홍길동', 'hong@example.com', NOW()) ON CONFLICT (user_id) DO NOTHING;

-- Projects
INSERT INTO projects (project_id, user_id, name, field, url)
VALUES (1, 1, '보안 로그 분석 프로젝트', '보안', 'test-api-key-123',) ON CONFLICT (project_id) DO NOTHING;

-- Models
INSERT INTO models (model_id, project_id, name, api_key, dashboard, created_at)
VALUES (1,
        1,
        '모델1',
        'http://backend/api/model1',
        '{"dashboard": "example"}',
        NOW()) ON CONFLICT (model_id) DO NOTHING;
