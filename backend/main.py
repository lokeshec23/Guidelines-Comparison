# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth.routes import router as auth_router

app = FastAPI(title="FastAPI + MongoDB Auth API")

# ✅ CORS setup
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Include authentication routes
app.include_router(auth_router)

@app.get("/")
def root():
    return {"message": "FastAPI + MongoDB Auth backend is running 🚀"}
