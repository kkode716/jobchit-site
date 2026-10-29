// Quoted word for word from leginfo.legislature.ca.gov, read in the browser on the verified date (R3, R4).
// Re-read both sections and update `verified` before any change to this page goes live.
const source = (section) => `https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=${section}`;

export default {
  verified: '2026-10-29',
  verifiedText: 'October 29, 2026',
  sections: [
    {
      number: '7159',
      title: 'Home improvement contracts',
      url: source('7159'),
      history: 'Amended by Stats. 2025, Ch. 585, Sec. 1.5 (SB 517), effective January 1, 2026.',
      quotes: [
        {
          cite: '7159(c)(3)(A)',
          text: 'Before any work is started, the contractor shall give the buyer a copy of the contract that is signed and dated by both the contractor and the buyer. The buyer’s receipt of the copy of the contract initiates the buyer’s rights to cancel the contract pursuant to Sections 1689.5 to 1689.14, inclusive, of the Civil Code.',
        },
        {
          cite: '7159(c)(5)',
          text: 'A change-order form for changes or extra work shall be incorporated into the contract and shall become part of the contract only if it is in writing and signed by the parties prior to the commencement of any work covered by a change order.',
        },
        {
          cite: '7159(d), opening',
          text: 'A home improvement contract and any changes to the contract shall be in writing and signed by the parties to the contract prior to the commencement of work covered by the contract or an applicable change order and, except as provided in paragraph (8) of subdivision (a) of Section 7159.5, shall include or comply with all of the following:',
        },
        {
          cite: '7159(d)(13)',
          text: 'The heading: “Note About Extra Work and Change Orders,” followed by the following statement: “Extra Work and Change Orders become part of the contract once the order is prepared in writing and signed by the parties prior to the commencement of work covered by the new change order. The order must describe the scope of the extra work or change, the cost to be added or subtracted from the contract, and the effect the order will have on the schedule of progress payments.”',
        },
      ],
    },
    {
      number: '7159.10',
      title: 'Service and repair contracts',
      url: source('7159.10'),
      history: 'Amended by Stats. 2020, Ch. 158, Sec. 3 (AB 2471), effective January 1, 2021.',
      quotes: [
        {
          cite: '7159.10(d)(1)',
          text: 'The contract, any changes to the contract, and any attachments shall be in writing and signed or acknowledged by the parties as set forth in this section, and shall be written in the same language (for example Spanish) as principally used in the oral sales presentation.',
        },
        {
          cite: '7159.10(d)(4)',
          text: 'Before any work is started, the contractor shall give the buyer a copy of the contract signed and dated by the buyer and by the contractor or the contractor’s representative.',
        },
      ],
    },
  ],
};
