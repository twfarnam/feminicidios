import './style.css'
import React from 'react'
import ReactDOM from 'react-dom'
import ReactSlider from 'react-slider'
import * as d3 from 'd3'
import { MdPlayArrow, MdPause } from 'react-icons/md'
import { sortBy } from 'lodash'
import states from '../data/states.json'
import data from '../data/states_feminicide_sm.json'

const width = 500
const height = 300

const projection = d3.geoConicEqualArea()
  .parallels([18, 36])
  .rotate([96, 0])
  .center([-5.6, 24.2])
  .translate([width/2, height/2])
  .scale([860]);

const path = d3.geoPath().projection(projection);

// const color = d3.scaleQuantile()
//   .range([
//     "rgb(237, 248, 233)",
//     "rgb(186, 228, 179)",
//     "rgb(116,196,118)",
//     "rgb(49,163,84)",
//     "rgb(0,109,44)",
//   ])

// color.domain([
//   d3.min(data, d => d.count),
//   d3.max(data, d => d.count),
// ]);

// XXX make this dynamic
const radius = d3.scaleSqrt([0, 500], [0, 15])

const dates = data.hd.reduce((dates, d) => {
  if (!dates.includes(d.date)) dates.push(d.date)
  return dates
}, [])


const cdmx = states.features.find(
  s => s.properties.ADMIN_NAME == 'Distrito Federal',
)
cdmx.properties.ADMIN_NAME = 'Ciudad de Mexico'

const stateNames = [
  'Aguascalientes',
  'Baja California',
  'Baja California Sur',
  'Campeche',
  'Coahuila',
  'Colima',
  'Chiapas',
  'Chihuahua',
  'Ciudad de México',
  'Durango',
  'Guanajuato',
  'Guerrero',
  'Hidalgo',
  'Jalisco',
  'México',
  'Michoacán',
  'Morelos',
  'Nayarit',
  'Nuevo León',
  'Oaxaca',
  'Puebla',
  'Querétaro',
  'Quintana Roo',
  'San Luis Potosí',
  'Sinaloa',
  'Sonora',
  'Tabasco',
  'Tamaulipas',
  'Tlaxcala',
  'Veracruz',
  'Yucatán',
  'Zacatecas',
]

states.features.map(f => {
  const name = f.properties.ADMIN_NAME.toLowerCase()
  let stateData = data.hd.filter(d =>
    d.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "") == name
  )

  f.properties.name = stateNames.find(n => {
    return n.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")
      == name
  })
  if (f.properties.name == 'México') {
    f.properties.name = 'Estado de México'
  }

  stateData = sortBy(stateData, d => d.date)
  let sum = 0
  stateData = stateData.reduce((hash, d) => {
    sum += d.count
    d.sum = sum
    hash[d.date] = d
    return hash
  }, {})
  if (stateData) f.properties.data = stateData
})

const sorted = sortBy(
  states.features,
  d => d.properties.data[dates[dates.length-1]].sum,
)
sorted.reverse()

const meses = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

function App() {
  const [date, setDate] = React.useState(dates[dates.length-1])
  const [state, setState] = React.useState(null)
  const [timer, setTimer] = React.useState(null)
  const [animating, setAnimating] = React.useState(false)

  function stopAnimation() {
    setAnimating(false)
    setTimer(timer => {
      timer.stop()
      return null
    })
  }

  function onChangeSlider(value) {
    if (animating) stopAnimation()
    setDate(dates[value])
  }

  function onMouseEnterState(state) {
    setState(state)
  }

  function onClickPlayAnimation() {
    setDate(dates[0])
    setAnimating(true)
    setTimer(() => d3.timer(elapsed => {
      const index = Math.floor(elapsed / 200)
      if (index < dates.length) {
        setDate(dates[index])
      } else {
        stopAnimation()
      }
    }))
  }

  function onClickPauseAnimation() {
    stopAnimation()
  }

  return (
    <div>
      { state &&
        <div className="state-detail">
          <div className="state-name">{state.properties.name}</div>
          <div className="cases">
            {state.properties.data[date].sum} feminicidios
          </div>
        </div>
      }
      <div className="controls">
        Número de víctimas de feminicidio
        <div className="button">
          { animating
            ? <MdPause onClick={onClickPauseAnimation} />
            : <MdPlayArrow onClick={onClickPlayAnimation}/>
          }
        </div>
        <div className="date-row">
          <div>
            <div className="month">{meses[parseInt(dates[0].substr(5,2))-1]}</div>
            <div className="year">{dates[0].substr(0,4)}</div>
          </div>
          <div className="separator">a</div>
          <div>
            <div className="month">{meses[parseInt(date.substr(5,2))-1]}</div>
            <div className="year">{date.substr(0,4)}</div>
          </div>
        </div>
        <ReactSlider
          value={dates.indexOf(date)}
          onChange={onChangeSlider}
          className="slider"
          thumbClassName="slider-thumb"
          trackClassName="slider-track"
          min={0}
          max={dates.length - 1}
          renderThumb={(props, state) => <div {...props} />}
        />
      </div>
      <svg className="map" viewBox={`0 0 ${width} ${height}`}>
        { sorted.map((s,i) =>
          <path
            className="state"
            key={i}
            d={path(s)}
            onMouseEnter={() => onMouseEnterState(s)}
          />
        )}
        { sorted.map((s,i) => 
          <circle
            key={i}
            className="bubble"
            transform={`translate(${path.centroid(s)})`}
            r={radius(s.properties.data[date].sum)}
            onMouseEnter={() => onMouseEnterState(s)}
          />
        )}
      </svg>

      <div className="source">
        FUENTE: Secretariado Ejecutivo del Sistema Nacional de Seguridad Pública por
        {' '}
        <a target="_blank" href="https://elcri.men/acerca/">elcri.men</a>
      </div>
    </div>
  )
}

ReactDOM.render(<App />, document.querySelector('#app'))

if (module.hot) module.hot.accept()

