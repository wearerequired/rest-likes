/**
 * Internal dependencies
 */
import metadata from './block.json';
import edit from './edit';
// @ts-expect-error
import { ReactComponent as BlockIcon } from './icon.svg';

const { name } = metadata;

export { metadata, name };

export const settings = {
	icon: BlockIcon,
	edit,
};
