from sqlalchemy import Table, MetaData


def get_ai_result_table(model_id: int):
    """
    이미 존재하는 ai_results_{model_id} 테이블을 불러옵니다.
    """
    metadata = MetaData()
    table_name = f"ai_results_{model_id}"
    return Table(table_name, metadata, autoload_with=engine)  # 기존 테이블 로딩
