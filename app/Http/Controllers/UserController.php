<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;


class UserController extends Controller
{
    public function show($id)
    {
        try {
            $user = User::findOrFail($id);
            return response()->json([
                'success' => true,
                'message' => 'Usuario encontrado',
                'data' => $user
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al buscar el usuario'
            ], 500);
        }
    }

    // Actualizar Credenciales del administrador
    public function updateDataAdmin(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);

            if ($request->password !== $request->conPassword) {
                return response()->json([
                    'success' => false,
                    'message' => 'Errores de validación',
                    'errors' => 'Las contraseñas no
                            coinciden'
                ], 200);
            } else {
                $data = $request->all();

                if (empty($data['password'])) {
                    unset($data['password']);
                }

                $user->update($data);

                return response()->json([
                    'success' => true,
                    'title' => 'Exitoso!',
                    'message' => 'Datos Actualizados Correctamente.'
                ], 200);
            }
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor: ' . $e->getMessage()
            ], 500);
        }
    }
}
