from sqlalchemy import Table, Column, Integer, String, Boolean, Float, DateTime, MetaData, CHAR

metadata = MetaData()

def create_ai_result_table(model_id: int):
    """
    특정 model_id에 대해 ai_results_<model_id> 테이블을 동적으로 생성합니다.
    """
    table_name = f"ai_results_{model_id}"
    return Table(
        table_name,
        metadata,
        Column("ai_result_id", String(255), primary_key=True),
        Column("model_id", Integer, nullable=False),
        Column("logged_at", DateTime, nullable=False),
        Column("client_ip_v4", String(15), nullable=False),
        Column("method", String(10)),
        Column("url_path", String(2000)),
        Column("status_code", CHAR(3)),
        Column("is_attack", Boolean, nullable=False),
        Column("attack_score", Float),
        Column("attack_type", String(50))
    )
