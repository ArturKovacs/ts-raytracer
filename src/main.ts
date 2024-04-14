import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'
import { Renderer } from './renderer.ts'

const canvas = document.querySelector("#render-out") as HTMLCanvasElement;
const renderer = new Renderer(canvas);

function render(time: number) {
  renderer.render(time);

  // window.requestAnimationFrame(render);
}

render(0);
