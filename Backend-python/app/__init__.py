from flask import Flask
from flask_cors import CORS

from app.controllers.auth_controller import auth_bp
from app.controllers.user_controller import user_bp

def create_app():
    app = Flask(__name__)

    CORS(app)

    # Registrar Blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(user_bp, url_prefix="/api/user")

    @app.route("/")
    def home():
        return {
            "success": True,
            "message": "CloudCinema API Flask funcionando"
        }

    return app