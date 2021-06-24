const { promisify } = require('util');
const { exec } = require('child_process');

const TOTITLECASE = /[A-Za-zÀ-ÖØ-öø-ÿ]\S*/g;
const REGEXPESC = /[-/\\^$*+?.()|[\]{}]/g;
/**
 * Contains static methods to be used throughout the bot.
 */
class Util {

	/**
	 * This class may not be initiated with new
	 * @since 0.0.1
	 * @throws {Error}
	 * @private
	 */
	constructor() {
		throw new Error('This class may not be initated with new');
	}

	/**
	 * Converts a string to Title Case
	 * @since 0.0.1
	 * @param {string} text The text to  title case.
	 * @returns {string}
	 */
	static toTitleCase(text) {
		return text.replace(TOTITLECASE, (txt) => Util.titleCaseVariants[txt] || txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
	}

	/**
	 * Cleans a string from regex injection
	 * @since 0.0.1
	 * @param {string} str The string to clean
	 * @returns {string}
	 */
	static regExpEsc(str) {
		return str.replace(REGEXPESC, '\\$&');
	}

	/**
	 * Merges two objects
	 * @since 0.0.1
	 * @param {*} objTarget The object to be merged
	 * @param {*} objSource The object to merge
	 * @returns {*}
	 */
	static mergeObjects(objTarget = {}, objSource) {
		for (const key in objSource) objTarget[key] = Util.isObject(objSource[key]) ? Util.mergeObjects(objTarget[key], objSource[key]) : objSource[key];
		return objTarget;
	}

	/**
	 * Deep clone a value
	 * @since 0.5.0
	 * @param {*} source The object to clone
	 * @returns {*}
	 */
	static deepClone(source) {
		// Check if it's a primitive (with exception of function and null, which is typeof object)
		if (source === null || Util.isPrimitive(source)) return source;
		if (Array.isArray(source)) {
			const output = [];
			for (const value of source) output.push(Util.deepClone(value));
			return output;
		}
		if (Util.isObject(source)) {
			const output = {};
			for (const [key, value] of Object.entries(source)) output[key] = Util.deepClone(value);
			return output;
		}
		if (source instanceof Map) {
			const output = new source.constructor();
			for (const [key, value] of source.entries()) output.set(key, Util.deepClone(value));
			return output;
		}
		if (source instanceof Set) {
			const output = new source.constructor();
			for (const value of source.values()) output.add(Util.deepClone(value));
			return output;
		}
		return source;
	}

	/**
	 * Verify if the input is a function.
	 * @since 0.5.0
	 * @param {Function} input The function to verify
	 * @returns {boolean}
	 */
	static isFunction(input) {
		return typeof input === 'function';
	}

	/**
	 * Verify if the input is a class constructor.
	 * @since 0.5.0
	 * @param {Function} input The function to verify
	 * @returns {boolean}
	 */
	static isClass(input) {
		return typeof input === 'function' &&
			typeof input.prototype === 'object' &&
			input.toString().substring(0, 5) === 'class';
	}

	/**
	 * Verify if the input is an object literal (or class).
	 * @since 0.5.0
	 * @param {Object} input The object to verify
	 * @returns {boolean}
	 */
	static isObject(input) {
		return input && input.constructor === Object;
	}

	/**
	 * Verify if a number is a finite number.
	 * @since 0.5.0
	 * @param {number} input The number to verify
	 * @returns {boolean}
	 */
	static isNumber(input) {
		return typeof input === 'number' && !isNaN(input) && Number.isFinite(input);
	}

	/**
	 * Check whether a value is a primitive
	 * @since 0.5.0
	 * @param {*} value The value to check
	 * @returns {boolean}
	 */
	static isPrimitive(value) {
		return Util.PRIMITIVE_TYPES.includes(typeof value);
	}

	/**
	 * Verify if an object is a promise.
	 * @since 0.5.0
	 * @param {Promise} input The promise to verify
	 * @returns {boolean}
	 */
	static isThenable(input) {
		if (!input) return false;
		return (input instanceof Promise) ||
			(input !== Promise.prototype && Util.isFunction(input.then) && Util.isFunction(input.catch));
	}

	/**
	 * Sets default properties on an object that aren't already specified.
	 * @since 0.5.0
	 * @param {Object} def Default properties
	 * @param {Object} [given] Object to assign defaults to
	 * @returns {Object}
	 * @private
	 */
	static mergeDefault(def, given) {
		if (!given) return Util.deepClone(def);
		for (const key in def) {
			if (typeof given[key] === 'undefined') given[key] = Util.deepClone(def[key]);
			else if (Util.isObject(given[key])) given[key] = Util.mergeDefault(def[key], given[key]);
		}

		return given;
	}

	/**
	 * Compare if both arrays are strictly equal
	 * @since 0.5.0
	 * @param {any[]} arr1 The first array to compare
	 * @param {any[]} arr2 The second array to compare
	 * @returns {boolean}
	 */
	static arraysStrictEquals(arr1, arr2) {
		if (arr1 === arr2) return true;
		if (arr1.length !== arr2.length) return false;

		for (let i = 0; i < arr1.length; i++) {
			if (arr1[i] !== arr2[i]) return false;
		}
		return true;
	}

	/**
	 * Convert an object to a tuple
	 * @since 0.5.0
	 * @param {Object<string, *>} object The object to convert
	 * @param {string} [prefix=''] The prefix for the key
	 * @returns {Array<Array<*>>}
	 */
	static objectToTuples(object, prefix = '') {
		const entries = [];
		for (const [key, value] of Object.entries(object)) {
			if (Util.isObject(value)) {
				entries.push(...Util.objectToTuples(value, `${prefix}${key}.`));
			} else {
				entries.push([`${prefix}${key}`, value]);
			}
		}

		return entries;
	}

}

/**
 * Promisified version of child_process.exec for use with await
 * @since 0.3.0
 * @param {string} command The command to run
 * @param {external:ExecOptions} [options] The options to pass to exec
 * @returns {Promise<{ stdout: string, stderr: string }>}
 * @method
 * @static
 */
Util.exec = promisify(exec);

/**
 * Promisified version of setTimeout for use with await
 * @since 0.3.0
 * @param {number} delay The amount of time in ms to delay
 * @param {*} [args] Any args to pass to the .then (mostly pointless in this form)
 * @returns {Promise<*>} The args value passed in
 * @method
 * @static
 */
Util.sleep = promisify(setTimeout);

/**
 * The primitive types
 * @since 0.5.0
 * @type {string[]}
 * @static
 */
Util.PRIMITIVE_TYPES = ['string', 'bigint', 'number', 'boolean'];


module.exports = Util;
