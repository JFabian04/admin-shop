<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller

{
    //Authenticate the user
    public function login(Request $request)
    {
        try {
            $request->validate([
                'name' => 'sometimes|required',
                'email' => 'sometimes|required|email',
                'password' => 'required',
            ]);

            $user = User::where('email', $request->name)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json(['success' => false, 'message' => 'Credenciales incorrectas'], 200);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json(['success' => true, 'token' => $token, 'data' => $user, 'token_type' => 'Bearer']);
        } catch (ValidationException $e) {
            // Manejar errores de validación
            return response()->json([
                'success' => false,
                'message' => 'Errores de validación',
                'errors' => $e->errors()
            ], 200);
        } catch (\Exception $e) {
            // Manejar cualquier otra excepción
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor: ' + $e->getMessage()
            ], 500);
        }
    }

    // Método para cerrar sesión y revocar el token
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Cierre de sesión exitoso']);
    }

    // Función principal para comparar si hay login o no 
    public function authenticate()
    {
        // Verifica si el usuario está autenticado
        if (Auth::guard('sanctum')->check()) {
            // Obtiene el usuario autenticado
            $user = Auth::guard('sanctum')->user();

            return response()->json([
                'authorized' => true,
                'user_id' => $user->id,  // Retorna el ID del usuario autenticado
            ], 200);
        } else {
            return response()->json([
                'authorized' => false,
            ], 200);
        }
    }
}
