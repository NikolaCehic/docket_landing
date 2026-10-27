export function Boot() {
  return (
    <div id="boot" aria-hidden="true">
      <div className="b-bg"></div>
      <div className="b-top"><span className="mark">D</span><span>Docket</span><span className="b-ver">Pulse, Radiant Core</span><button className="b-skip" id="bootSkip" type="button" tabIndex={-1}>Skip <span className="kbd">Esc</span></button></div>
      <div className="b-seed"></div>
      <div className="b-greet" id="bootGreet"><b>Good morning, Agent.</b><span>Starting your briefing</span></div>
      <ol className="b-log" id="bootLog">
        <li>Starting Docket</li>
        <li>Seller Central synced 38m ago, 6 orders since midnight</li>
        <li>Amazon Ads synced 41m ago, $352 spent yesterday</li>
        <li>Your agents reported overnight</li>
        <li>PR-0019 expires at 12:00 PM</li>
        <li>Replaying the last 24 hours</li>
      </ol>
      <div className="b-pct"><span id="bootPct">000</span><small>%</small></div>
      <div className="b-bar"><i id="bootBar"></i></div>
    </div>
  )
}
