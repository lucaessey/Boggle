## ADDED Requirements

### Requirement: Linear scoring from config
Word scoring SHALL be computed from the `scoring` config in `balance.json`
(`minLength`, `basePoints`, `pointsPerExtraLetter`) as
`basePoints + (wordLength - minLength) * pointsPerExtraLetter`, with words shorter
than `minLength` scoring 0. The formula's constants SHALL live only in
`balance.json`. `scoreForWord(word)` SHALL keep a stable signature so a future
non-linear table could replace the implementation without changing call sites.

#### Scenario: Linear points by length
- **WHEN** words of length 3, 4, 5, 6, and 7 are scored with the default config
- **THEN** they score 1, 2, 3, 4, and 5 points respectively, with no upper cap

#### Scenario: Below minimum scores zero
- **WHEN** a word shorter than `minLength` is scored
- **THEN** it scores 0

#### Scenario: Constants only in balance.json
- **WHEN** the scoring constants change in `balance.json`
- **THEN** scores change accordingly without any code edit
