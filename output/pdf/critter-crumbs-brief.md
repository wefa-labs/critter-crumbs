# Critter Crumbs

A handful each. A shared decision.

Product brief for the Shutter team | September 2026

Critter Crumbs helps small groups decide how to share resources. Everyone gets the same handful of crumbs to give to people or budget options. Choices stay encrypted until a shared deadline, so people can decide without seeing everyone else's numbers.

## Why make this?

Sharing money can be awkward. An early suggestion can set the tone, while visible work can overshadow quieter contributions. Equal input and private choices give everyone more room to reflect.

## Recognise contributions

In a people feast, members describe their contributions and give crumbs to one another. Nobody can give crumbs to themselves.

## Share a budget

In an options feast, crumbs go to named priorities, such as community events or a shared resource. The totals guide a budget split.

## What a feast feels like

The group is a burrow. A person or option is a critter. A feast is the whole event, including the moment its results open.

### Gathering: Prepare the context

Members describe their contributions, or the organiser describes each option. Statements stay hidden until scattering opens.

### Scattering: Read, then share

Read the statements and share all your crumbs privately. You can replace your scatter until the deadline.

### Feast: See the outcome

After the deadline and key release, the app reveals each critter's share of the crumbs actually scattered.

Tap a critter, hold to pour, or type an amount. The pile shrinks as you share. Clear numbers and a simple 2D view keep everything usable without animation or sound.

## Starting with a real group

The planned first use is a council of 6 to 10 people in October 2026, following a September rehearsal. The initial release focuses on contribution recognition, a budget split, and clear results with a CSV export. Payments happen separately.

## Where Shutter fits

Shutter provides the intended time-based encryption layer. A feast registers its reveal time, and each scatter is encrypted in the participant's browser. Shutter's keypers work together to release the decryption key after that time. This relies on Shutter's threshold security assumptions and keyper availability. [1]

Once the key is available, each browser decrypts the submissions, checks them against the same rules, and adds up the crumbs. The server stores encrypted scatters; it does not calculate the result. Participation is visible to the burrow during scattering, while allocations remain hidden.

### What privacy means here

The promise is privacy before the deadline. After key release, anyone with access to the encrypted submissions can reconstruct individual scatters. Hiding them in the interface does not make them permanently secret.

## Where Critter Crumbs is heading

The longer-term aim is to carry a shared decision all the way through to payment, with an experience that feels like an everyday web app.

Add funds -> Hold a feast -> Validate results -> Distribute

### Funds held for a feast

A group could deposit funds into smart contracts and have them distributed according to the feast's validated result. The future design would define how results are verified, who receives each option's share, and how refunds work if a feast cannot finish.

### Join with an email

People could sign in with email or a familiar social account. Privy is a possible foundation for accounts created within the app, with signing and transaction fees handled as part of the experience. [2]

### Bring money in and take it out

The aim is to offer familiar ways to fund a feast and receive money afterward. Stripe's fiat-to-crypto onramp is one possible funding route. Withdrawal support and country coverage would be evaluated separately. These integrations are future plans. [3]

### Working with Shutter

The immediate focus is a dependable integration for the rehearsal: confirming the supported SDK and API path, production access, and recovery when registration or key release is delayed. This will help us test the full experience with the people who will use it.

## Further reading

[1] [Shutter: how it works](https://docs.shutter.network/docs/protocol/api/how_it_works)
[2] [Privy: accounts and sign-in](https://docs.privy.io/basics/key-concepts)
[3] [Stripe: crypto onramp](https://docs.stripe.com/crypto/onramp)
