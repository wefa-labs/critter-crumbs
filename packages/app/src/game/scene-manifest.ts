interface Crop {x:number;y:number;w:number;h:number}
interface Device {image:string;kind:string}
export function validateScenes(value:unknown):asserts value is {id:string;devices:{phone:Device;desktop:Device};floor:Crop;wall:Crop;cornerL:Crop;cornerR:Crop}[] {
 if(!Array.isArray(value)||!value.length)throw new TypeError('Invalid scene manifest');
 for(const scene of value){if(!scene.id||!scene.devices)throw new TypeError('Invalid scene identity');for(const device of [scene.devices.phone,scene.devices.desktop])if(!device||!device.image.startsWith('/scenes/')||!['crops','plate'].includes(device.kind))throw new TypeError('Invalid device scene');if(Object.values(scene.devices).some(device=>(device as Device).kind==='crops'))for(const crop of [scene.floor,scene.wall,scene.cornerL,scene.cornerR])if(!crop||![crop.x,crop.y,crop.w,crop.h].every(Number.isFinite)||crop.w<=0||crop.h<=0)throw new TypeError('Invalid scene crop');}
}
