from flask import Blueprint, request, jsonify
from app.services.playlist_service import (
    add_movie_to_playlist,
    list_user_playlist,
    delete_from_playlist
)

playlist_bp = Blueprint("playlist_bp", __name__)

@playlist_bp.route("/lista/agregar", methods=["POST"])
def add():
    try:
        data = request.json

        result = add_movie_to_playlist(
            data["id_usuario"],
            data["id_pelicula"]
        )

        return jsonify({
            "success": True,
            "message": "Película agregada a la lista",
            "data": result
        })

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400


@playlist_bp.route("/lista/<int:id_usuario>", methods=["GET"])
def get_user(id_usuario):
    try:
        playlist = list_user_playlist(id_usuario)
        return jsonify(playlist)
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400


@playlist_bp.route("/lista/eliminar", methods=["POST"])
def remove():
    try:
        data = request.json

        delete_from_playlist(
            data["id_usuario"],
            data["id_pelicula"]
        )

        return jsonify({
            "success": True,
            "message": "Película eliminada de la lista"
        })

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400