from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.exceptions import AppError
from app.db.connection import close_db, connect_db


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = get_settings()
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
    await connect_db()
    yield
    await close_db()


def create_app() -> FastAPI:
    settings = get_settings()
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)

    app = FastAPI(
        title="BSquare Mobile API",
        description="Separate Python/MongoDB backend for the mobile app signup flow",
        version="1.0.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(AppError)
    async def app_error_handler(_: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(status_code=exc.status_code, content={"error": exc.message})

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
        errors = exc.errors()
        message = errors[0].get("msg", "Validation error") if errors else "Validation error"
        if message.startswith("Value error, "):
            message = message.removeprefix("Value error, ")
        return JSONResponse(status_code=422, content={"error": message})

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(
        request: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        if exc.status_code == 404:
            return JSONResponse(
                status_code=404,
                content={
                    "status": "not_found",
                    "message": "Endpoint not found",
                    "path": request.url.path,
                    "health": "/api/v1/health",
                    "docs": "/docs",
                },
            )
        detail = exc.detail
        if not isinstance(detail, str):
            detail = str(detail)
        return JSONResponse(status_code=exc.status_code, content={"error": detail})

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(_: Request, exc: Exception) -> JSONResponse:
        # Keep production clients on a stable JSON error shape (no stack traces).
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error"},
        )

    @app.get("/", include_in_schema=False)
    async def root() -> dict[str, str]:
        """Browsers and load balancers often hit `/`."""
        return {
            "status": "ok",
            "service": "bsquare-mobile-api",
            "health": "/api/v1/health",
            "docs": "/docs",
        }

    @app.get("/favicon.ico", include_in_schema=False)
    async def favicon() -> Response:
        return Response(status_code=204)

    # Chrome / Edge / IDE DevTools often probe these on localhost.
    # They are not API routes — answer quietly so logs stay clean.
    @app.get("/json", include_in_schema=False)
    @app.get("/json/list", include_in_schema=False)
    @app.get("/json/version", include_in_schema=False)
    async def chrome_devtools_probe() -> Response:
        return Response(status_code=204)

    @app.get("/robots.txt", include_in_schema=False)
    async def robots() -> Response:
        return Response(
            content="User-agent: *\nDisallow: /\n",
            media_type="text/plain",
            status_code=200,
        )

    app.include_router(api_router)
    app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")
    return app


app = create_app()
