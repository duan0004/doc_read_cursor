-- 文献智能解读模块数据库初始化脚本

-- 创建数据库（如果不存在）
-- CREATE DATABASE doc_read_ai;

-- 使用数据库
-- \c doc_read_ai;

-- 创建UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 文档表
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    file_id VARCHAR(255) UNIQUE NOT NULL,
    original_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    page_count INTEGER NOT NULL,
    text_content TEXT,
    file_path TEXT NOT NULL,
    summary TEXT,
    keywords TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 文档分块表（用于向量搜索）
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    page_number INTEGER,
    chunk_index INTEGER,
    token_count INTEGER,
    embedding VECTOR(1536), -- OpenAI embedding维度
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 问答历史表
CREATE TABLE IF NOT EXISTS qa_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_documents_file_id ON documents(file_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_qa_history_document_id ON qa_history(document_id);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为documents表创建更新时间触发器
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 插入示例数据（可选）
-- INSERT INTO documents (file_id, original_name, file_size, page_count, text_content, file_path)
-- VALUES ('example-doc-1', '示例文档.pdf', 1024000, 10, '这是一个示例文档的内容...', '/uploads/example-doc-1.pdf');

COMMENT ON TABLE documents IS '文档信息表';
COMMENT ON TABLE document_chunks IS '文档分块表，用于向量搜索';
COMMENT ON TABLE qa_history IS '问答历史记录表';

-- 显示创建的表
\dt