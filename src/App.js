// import logo from './logo.svg';
import './App.css';
import {useEffect, useRef, useState} from "react";

const refColors = [
    {r: 203, g: 191, b: 165, a: 1, coff: 5},
    {r: 185, g: 165, b: 135, a: 1, coff: 3},
    {r: 166, g: 139, b: 105, a: 1, coff: 1},
    {r: 148, g: 113, b: 74, a: 1, coff: 0.5},
    {r: 129, g: 87, b: 44, a: 1, coff: 0},
].map(({b, g, r, coff}) => ({data: [r, g, b, 255], coff}));

function toRGBAString({data}) {
    return `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
}

function toRGBA({data}) {
    return {r: data[0], g: data[1], b: data[2], a: data[3]};
}

function getDiffColor(a, b) {
    return Math.sqrt(Math.pow((a.r - b.r), 2) + Math.pow((a.g - b.g), 2) + Math.pow((a.b - b.b), 2));
}

function updateActiveColors(colors, col) {
    colors.forEach(c => {
        c.active = false;
        c.diff = getDiffColor(toRGBA(col), toRGBA(c));
    });
    if (col) {
        const diffs = colors.map(c => getDiffColor(toRGBA(col), toRGBA(c)));
        const min1 = Math.min(...diffs);
        const min2 = Math.min(...diffs.filter(item => item !== min1));
        colors[diffs.indexOf(min1)].active = true;
        colors[diffs.indexOf(min2)].active = true;
    }
}

function App() {
    const [color, setColor] = useState(null);
    const [colors, setColors] = useState(() => {
        const initialValue = JSON.parse(localStorage.getItem("colors"));
        return initialValue || refColors;
    });
    const fileInput = useRef();
    useEffect(() => {
        localStorage.setItem('colors', JSON.stringify(colors));
    }, [colors]);

    function onImageChange(event) {
        const {files} = event.target;
        if (files && files[0]) {
            const img = new Image();
            img.onload = function () {
                const context = canvas.current.getContext("2d");

                context.imageSmoothingEnabled = true;
                context.drawImage(img, 0, 0, 1, 1);
                const average = context.getImageData(0, 0, 1, 1);

                setColor(average);
                const state = [...colors];
                updateActiveColors(state, average);
                setColors(state);
                context.drawImage(img, 100, 100);
            }
            img.src = URL.createObjectURL(files[0]);
        }
    }


    function pick(event) {
        const context = canvas.current.getContext("2d");

        const bounding = canvas.current.getBoundingClientRect();
        const x = event.clientX - bounding.left;
        const y = event.clientY - bounding.top;
        const pixel = context.getImageData(x, y, 1, 1);

        setColor(pixel);
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

    function drawColors(colors, isInput) {
        return (<ul style={{display: 'flex'}}>
            {colors.map((color, index) =>
                <li key={index} style={{margin: 15, listStyle: 'none'}}>
                    <label>
                        <div style={{
                            backgroundColor: toRGBAString(color),
                            display: 'block',
                            borderRadius: '50%',
                            width: 50,
                            height: 50,
                            border: color.active ?'solid 4px green':'solid 4px transparent'
                        }}/>
                        <input type='file' onChange={(e) => {
                            const {files} = e.target;
                            if (files && files[0]) {
                                const img = new Image();
                                img.onload = function () {
                                    const context = canvas.current.getContext("2d");

                                    context.imageSmoothingEnabled = true;
                                    context.drawImage(img, 0, 0, 1, 1);
                                    const state = [...colors];
                                    state[index].data = context.getImageData(0, 0, 1, 1).data;
                                    updateActiveColors(state, color);
                                    setColors(state);
                                }
                                img.src = URL.createObjectURL(files[0]);
                            }
                        }
                        }
                               accept="image/png, image/jpeg"
                               style={{display: 'none'}}
                        />
                    </label>
                    {isInput && <input
                        value={color.coff}
                        type="number" step="0.01"
                        style={{width: 50}}
                        onChange={e => {
                            const state = [...colors];
                            state[index].coff = e.target.value;
                            updateActiveColors(state, color);
                            setColors(state);
                        }}
                    />}
                </li>
            )}
        </ul>)
    }

    /*function normalize(min, max) {
        var delta = max - min;
        return function (val) {
            return (val - min) / delta;
        };
    }*/

    let concentration;

    const isActive = colors.filter(item => item.active);
    if (isActive.length !== 0) {
        const diffs = colors.map(c => c.diff);
        const min1 = Math.min(...diffs);
        const min2 = Math.min(...diffs.filter(item => item !== min1));
        const diff = min2 + min1;
        concentration = colors[diffs.indexOf(min1)].coff * (min2 / diff) + colors[diffs.indexOf(min2    )].coff * (1 - min2 / diff);
    }

    /*if (colors[0]) {
        const diffs = refColors.map(color => getDiffColor(toRGBA(colors[0]), toRGBA(color)));
        const min1 = Math.min(...diffs);
        const min2 = Math.min(...diffs.filter(item => item !== min1));
        // console.log(min1, min2);
        const diff = min2 + min1;
        // console.log(min2 / diff,);
        concentration = refColors[diffs.indexOf(min1)].coff * (min2 / diff) + refColors[diffs.indexOf(min2)].coff * (1 - min2 / diff);
        // console.log('normalize:', diffs.map(normalize(min, max)))
        // concentration = diffs.indexOf(min1);
    }*/

    return (
        <div className="App">
            <input type='file' ref={fileInput} onChange={onImageChange}
                   accept="image/png, image/jpeg"
            />
            <canvas style={{
                display: 'block',
                margin: '0 auto',
                width: '100%',
                maxWidth: '500px',
            }} ref={canvas} width={500} height={500} onPointerDown={(e) => pick(e)}/>

            {color && <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                Picked:
                {drawColors([color], false)}
            </div>
            }
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap'
            }}>
                Reference:
                {drawColors(colors, true)}
            </div>
            {concentration && <div>Concentration: {concentration.toFixed(2)}</div>}
        </div>
    );
}

export default App;
