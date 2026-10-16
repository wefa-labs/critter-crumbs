import './style.css';
import { registerGardenRenderer } from '../garden-registry.js';
import { gardenDraw, gardenLayout, paintGarden } from './species.js';
registerGardenRenderer({
  paint: (document, params, state) => paintGarden(document, params, { ...state, finish: 'painted' }),
  metrics: (params, fed) => gardenLayout(gardenDraw(params, 'painted'), fed),
});
