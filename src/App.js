// import logo from './logo.svg';
import './App.css';
import {useRef, useState} from "react";

function App() {
    const refColors = [
        {
            r: 129, g: 85, b: 50
        },
        {
            r: 130, g: 90, b: 40
        },
        {
            r: 136, g: 95, b: 51
        },
        {
            r: 140, g: 100, b: 40
        },
        {
            r: 120, g: 96, b: 40
        }
    ].map(({b, g, r}) => ({data:[r, g, b, 255]}));
    const [colors, setColors] = useState([]);
    const fileInput = useRef();

    function onImageChange(event) {
        const {files} = event.target;
        if (files && files[0]) {
            const img = new Image();
            img.onload = function () {
                const context = canvas.current.getContext("2d");

                context.imageSmoothingEnabled = true;
                context.drawImage(img, 0, 0, 1, 1);
                const average = context.getImageData(0, 0, 1, 1);

                setColors([average]);
                context.drawImage(img, 100, 100);
            }
            img.src = URL.createObjectURL(files[0]);
        }
    }

    function toRGBA({data}) {
        return `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
    }

    function pick(event) {
        const context = canvas.current.getContext("2d");

        const bounding = canvas.current.getBoundingClientRect();
        const x = event.clientX - bounding.left;
        const y = event.clientY - bounding.top;
        const pixel = context.getImageData(x, y, 1, 1);

        setColors([pixel]);
    }

    /*    function average(context){
                data = context.getImageData(0, 0, width, height);

            const length = data.data.length;

            while ( (i += blockSize * 4) < length ) {
                ++count;
                rgb.r += data.data[i];
                rgb.g += data.data[i+1];
                rgb.b += data.data[i+2];
            }

            // ~~ used to floor values
            rgb.r = ~~(rgb.r/count);
            rgb.g = ~~(rgb.g/count);
            rgb.b = ~~(rgb.b/count);
        }*/

    const canvas = useRef();

    function drawColors(colors) {
        return (<ul style={{display: 'flex'}}>
            {colors.map((color, index) =>
                <li key={index} style={{margin: 15, listStyle: 'none'}}>
                    <div style={{
                        backgroundColor: toRGBA(color),
                        display: 'block',
                        borderRadius: '50%',
                        width: 50,
                        height: 50
                    }}/></li>
            )}
        </ul>)
    }

    function getDiffColor(a,b) {
        return Math.sqrt(Math.pow((a.r - b.r),2) + Math.pow((a.g - b.g),2) + Math.pow((a.b - b.b),2));
    }

    // let closest;
    if(colors[0]){
        const diffs = refColors.map(color=>getDiffColor(colors[0],color));
        console.log(diffs.indexMath.min(...diffs));
    }

    return (
        <div className="App">
            {/*<header className="App-header">*/}
            {/*<img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>*/}
            {/*<form onSubmit={handleSubmit}>*/}
            <input type='file' ref={fileInput} onChange={onImageChange}/>
            {/*{image && <img alt="preview image" src={image}/>}*/}
            <canvas ref={canvas} width={500} height={500} onPointerDown={(e) => pick(e)}/>
            {/*</form>*/}
            {/*</header>*/}

            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                Picked
                {drawColors(colors)}
            </div>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                Reference
                {drawColors(refColors)}
            </div>
        </div>
    );
}

export default App;
