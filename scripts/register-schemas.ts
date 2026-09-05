import { ballotSchema, prepareSchemaRegistration, resultSchema } from '@critter-crumbs/core';
const args = process.argv.slice(2);
if (args.length !== 0 && (args.length !== 2 || args[0] !== '--chain')) throw new Error('Usage: register-schemas [--chain 8453|84532]. This command only prepares requests.');
const chainId = Number(args[1] ?? process.env.EAS_CHAIN_ID ?? '84532');
if (chainId !== 8453 && chainId !== 84532) throw new Error('Choose Base 8453 or Base Sepolia 84532.');
const schemas = [ballotSchema, resultSchema].map(schema => ({ schema, ...prepareSchemaRegistration(schema) }));
console.log(JSON.stringify({ chainId, schemas }, (_key, value: unknown) => typeof value === 'bigint' ? value.toString() : value, 2));
