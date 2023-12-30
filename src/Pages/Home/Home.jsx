import React from 'react'
import './home.css'
import { Link as Anchor } from 'react-router-dom'

export default function Home() {

  return (
    <div className='home'>
      <h1>VISTA HOME</h1>
      <Anchor to={'/login'}>Iniciar sesion</Anchor> <br /><Anchor to={'/register'}>Registro</Anchor>
    </div>
  )
}
