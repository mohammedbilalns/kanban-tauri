import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { writeTextFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import "./App.css";


function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState(0);
  const [error , setError] = useState("");
  const [todos, setTodos] = useState([]);

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  async function greetBetter(){
    setGreetMsg( await invoke("say_age", {name, age}))
  }

  async function writeName(name : string){
    await writeTextFile(
      "data/names.json",
      JSON.stringify({name}, null , 2)   )



  }

  return (
    <main className="container">
      <h1>Welcome to Tauri + React</h1>

      <div className="row">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
          writeName(name)
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>

        <div>

          <input type="number" id="age-input" onChange={(e) => setAge(Number(e.currentTarget.value))} />
          <button onClick={(e) => {
            e.preventDefault()
            greetBetter()
          }} >Greet better</button>
        </div>

      </form>
      <p>{greetMsg}</p>
      {error && <p>{error}</p>}
    </main>
  );
}

export default App;
