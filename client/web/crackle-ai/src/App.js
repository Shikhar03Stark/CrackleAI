import React from 'react'
import Header from './components/Header';
import Main from "./components/Main";
import ResultScreen from './components/ResultScreen';
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
    <Header/>
    <Routes>
      <Route path='/result' element={<ResultScreen/>}/>
      <Route path='*' element={<Main/>} />
    </Routes>
    </BrowserRouter>
  );
}

export default App;
