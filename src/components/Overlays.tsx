// Fixed layers behind and above the scenes: the engraved backdrop and the core (canvases), the core's hit area,
// and the desktop chapter mark (the scene's number and name) with the progress line along the foot.
export function Overlays() {
  return (
    <>
      <canvas id="backdrop" aria-hidden="true"></canvas>
      <canvas id="core" aria-hidden="true"></canvas>
      <div id="coreHit" role="button" tabIndex={-1} aria-label="The Radiant Core. Drag to turn it, click to ping it, hold to charge it."></div>
      <p id="clock" aria-hidden="true"><i></i><span id="clockT" className="mono">02</span><b id="clockL">How it works</b></p>
      <div id="prog" aria-hidden="true"><i id="progI"></i></div>
    </>
  )
}
