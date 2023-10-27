import React from 'react'
import "./login.css"

export default function Login() {
  return (
    <section class="flex justify-center items-center mt-12">	
      <main class="w-11/12 md:max-w-5xl mx-auto grid md:grid-cols-2 rounded">
        <div class="bg-pizza w-full h-72 md:h-auto">
          
        </div>

        <div class="p-8 bg-white">
          <div class="flex gap-1 items-center justify-center">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#f87171" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                
            </span>
            <h1 class="text-center text-slate-900 font-bold text-2xl">Login</h1>
          </div>
          <p class="text-slate-500 text-center text-sm mt-2">Si ya tenés una cuenta, iniciá sesión y disfrutá de la mejor comida en la puerta de tu casa</p>

          <form class="mt-8">
            <div class="py-2">
              <label for="email" class="block font-bold text-slate-900">E-mail</label>
              <input type="email" name="email" id="email" class="w-full bg-gray-100 p-2 mt-1 border-l-4 border-red-400 focus:outline-none" placeholder="Correo@correo.com"/>
            </div>
            <div class="py-2">
              <label for="password" class="block font-bold text-slate-900">Contraseña</label>
              <input type="password" name="password" id="password" class="w-full bg-gray-100 p-2 mt-1 border-l-4 border-red-400 focus:outline-none" placeholder="Tu contraseña"/>
            </div>

            <input type="submit" class="w-full bg-red-400 rounded text-white py-2 mt-2" value="Iniciar sesión"/>
          </form>

          <p class="text-slate-500 mt-5 flex gap-1">¿Todavía no tenés cuenta? 
            <span class="text-red-400 flex">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#f87171" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                
              <a href="">Registrate</a>
            </span>
          </p>
        </div>
      </main>	
	  </section>
  )
}
