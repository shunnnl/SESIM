from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class DeploymentLog(Base):
    __tablename__ = "deployment_logs"

    deployment_log_id = Column(Integer, primary_key=True, autoincrement=True)
    model_id = Column(Integer, ForeignKey("models.model_id"), nullable=False)
    log_type = Column(String(20), nullable=False)
    status = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    duration_ms = Column(Integer)
    logged_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, nullable=False)


class AITrain(Base):
    __tablename__ = "ai_trains"

    ai_train_id = Column(Integer, primary_key=True, autoincrement=True)
    model_id = Column(Integer, ForeignKey("models.model_id"), nullable=False)
    path = Column(String(2000), nullable=False)
    created_at = Column(DateTime, nullable=False)


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    nickname = Column(String(50), nullable=False)
    email = Column(String(100), nullable=False)
    created_at = Column(DateTime, nullable=False)


class Model(Base):
    __tablename__ = "models"

    model_id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=False)
    name = Column(String(255), nullable=False)
    api_key = Column(String(2000), nullable=False)
    dashboard = Column(Text, nullable=False)
    ec2_spec = Column(String(50), nullable=False)
    ec2_info = Column(String(255), nullable=False)
    created_at = Column(DateTime, nullable=False)


class Project(Base):
    __tablename__ = "projects"

    project_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    url = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    desc = Column(String(2000))


class APILog(Base):
    __tablename__ = "api_logs"

    api_log_id = Column(Integer, primary_key=True, autoincrement=True)
    model_id = Column(Integer, ForeignKey("models.model_id"), nullable=False)
    name = Column(String(100), nullable=False)
    latency_ms = Column(Integer, nullable=False)
    usage_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, nullable=False)
