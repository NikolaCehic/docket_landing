import { createFileRoute } from '@tanstack/react-router'
import { Agents, Boot, Feature, Final, Hero, Nav, Overlays, Proposal, Pulse, System } from '../components'
import { AUTOMATE, MEMORY } from '../data/system'
import { Experience } from '../components/Experience'
import { Sheets } from '../components/Sheets'

export const Route = createFileRoute('/')({ component: Landing })

// The system, in eight scenes, with the Radiant Core carried through all of them: the promise (hero), how Docket works
// (the loop), the agents, Pulse (Docket's voice, at the desk and on the phone), Command, Memory, plays and workflows,
// and the close with the first scan and pricing. On desktop each scene is a stage held on screen while you scroll through
// it, its own timeline following the scroll, and the next comes in over it; on phones and with reduced motion they are a plain scrolling
// page, and each scene plays when it comes into view.
function Landing() {
  return (
    <>
      <Boot />
      <Nav />
      <Overlays />
      <main id="main">
        <Hero />
        <System />
        <Agents />
        <Pulse />
        <Proposal />
        <Feature f={MEMORY} />
        <Feature f={AUTOMATE} />
        <Final />
      </main>
      <Sheets />
      <Experience />
    </>
  )
}
