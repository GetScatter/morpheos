# MorphEOS

This library allows you to use any version of `eosjs` indistinctly.


### Usage

```js
import Morpheos from 'morpheos';

const eos = Eos({ httpEndpoint: 'https://api.jungle.alohaeos.com' });
const morph = new Morpheos(eos);

morph.transact(...);

```