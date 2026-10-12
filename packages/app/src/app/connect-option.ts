import type { AccountOption } from '@critter-crumbs/core';

/**
 * A connect choice's picture comes from the app that announced itself, so it is used only when it is an image carried
 * in the address itself: nothing is fetched from anywhere on that app's say-so. Without one the choice shows its
 * initial, as the flow page draws it.
 */
export const optionPicture = (option: AccountOption) => option.icon && /^data:image\/(?:png|jpeg|webp|gif|svg\+xml)[;,]/i.test(option.icon) ? option.icon : null;
export const optionInitial = (option: AccountOption) => [...option.name.trim()][0]?.toUpperCase() ?? '';
