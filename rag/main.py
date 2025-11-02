from fastapi import FastAPI, UploadFile, File, HTTPException
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, TextLoader, DirectoryLoader
from langchain.chains import RetrievalQA
from langchain_community.llms import Ollama
import tempfile
import os
from typing import List

app = FastAPI()

# Initialize components
embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
vector_store = None
qa_chain = None

def load_documents_from_directory(directory_path: str) -> List:
    """Load all documents from a directory."""
    loader = DirectoryLoader(
        directory_path,
        glob="**/*.*",  # Load all files
        loader_cls=lambda file_path: (
            PyPDFLoader(file_path) if file_path.endswith('.pdf')
            else TextLoader(file_path)
        )
    )
    return loader.load()

@app.on_event("startup")
async def startup_event():
    global vector_store, qa_chain
    # Initialize Chroma with persistent directory
    vector_store = Chroma(
        persist_directory="./chroma_db",
        embedding_function=embeddings
    )
    
    # Load documents from data directory if it exists
    data_dir = os.getenv("DATA_DIR", "/app/data")
    if os.path.exists(data_dir) and os.path.isdir(data_dir):
        try:
            documents = load_documents_from_directory(data_dir)
            if documents:
                # Split text into chunks
                text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=1000,
                    chunk_overlap=200
                )
                splits = text_splitter.split_documents(documents)
                
                # Add to vector store
                vector_store.add_documents(splits)
                print(f"Loaded {len(splits)} document chunks from {data_dir}")
        except Exception as e:
            print(f"Error loading documents from {data_dir}: {str(e)}")
    
    # Initialize Ollama LLM
    llm = Ollama(
        base_url="http://ollama:11434",
        model="qwen2.5-coder"
    )
    
    # Create QA chain
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=vector_store.as_retriever()
    )

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name

        # Load and process document
        if file.filename.endswith('.pdf'):
            loader = PyPDFLoader(temp_path)
        else:
            loader = TextLoader(temp_path)

        documents = loader.load()
        
        # Split text into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        splits = text_splitter.split_documents(documents)

        # Add to vector store
        vector_store.add_documents(splits)
        
        # Cleanup
        os.unlink(temp_path)
        
        return {"message": f"Successfully processed {file.filename}"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query")
async def query_documents(query: str):
    if not qa_chain:
        raise HTTPException(status_code=500, detail="RAG system not initialized")
    
    try:
        # Get response from QA chain
        response = qa_chain.run(query)
        return {"response": response}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))