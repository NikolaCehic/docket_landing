// The film's content that both the scenes (components) and their sequences (experience/scenes.ts) read.

/** The phone: a spoken change, step by step, with the phone screen for each */
export const PHONE_STEPS = [
  { k: 'Say it', d: '“Increase TOS on all campaigns containing CBO.” Kept word for word.', img: 'MobileChange1_Say' },
  { k: 'Understood', d: 'How Docket read it, with any questions it has for you.', img: 'MobileChange2_Read' },
  { k: 'Campaigns', d: 'Every matching campaign, found across your brands, with what will change.', img: 'MobileChange3_Match' },
  { k: 'Approve', d: 'One proposal per brand. Hold once to approve them all.', img: 'MobileChange4_Approve' },
  { k: 'Done', d: 'Live on Amazon, checked value by value. Undo for 24 hours.', img: 'MobileChange5_Done' },
]

/** Command: the pieces of the Command screen (captured from the product design), in the order they build */
export const CMD_ROWS = ['gh0', 'row0', 'row1', 'row2', 'gh1', 'row3', 'row4', 'row5', 'row6', 'row7', 'row8', 'row9', 'grp', 'row10']
export const CMD_DETAIL = ['title', 'change', 'expect', 'why', 'checks', 'details', 'bar']
export const CMD_AFTER = ['bar-after', 'head-after', 'tabs-after', 'gh0-after', 'navcmd-after', 'tail-after']
/** the parts of the proposal the green border walks, in turn, with its label; on desktop each is a step of the scroll,
 *  and the step after the last is the yes */
export const CMD_WALK: [string, string][] = [['change', 'The change'], ['expect', 'What we expect'], ['why', 'Why now'], ['checks', 'The checks it passed'], ['bar', 'Your call. Hold to approve']]
