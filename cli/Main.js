
(function() {
'use strict';

function F2(fun)
{
  function wrapper(a) { return function(b) { return fun(a,b); }; }
  wrapper.arity = 2;
  wrapper.func = fun;
  return wrapper;
}

function F3(fun)
{
  function wrapper(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  }
  wrapper.arity = 3;
  wrapper.func = fun;
  return wrapper;
}

function F4(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  }
  wrapper.arity = 4;
  wrapper.func = fun;
  return wrapper;
}

function F5(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  }
  wrapper.arity = 5;
  wrapper.func = fun;
  return wrapper;
}

function F6(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  }
  wrapper.arity = 6;
  wrapper.func = fun;
  return wrapper;
}

function F7(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  }
  wrapper.arity = 7;
  wrapper.func = fun;
  return wrapper;
}

function F8(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  }
  wrapper.arity = 8;
  wrapper.func = fun;
  return wrapper;
}

function F9(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  }
  wrapper.arity = 9;
  wrapper.func = fun;
  return wrapper;
}

function A2(fun, a, b)
{
  return fun.arity === 2
    ? fun.func(a, b)
    : fun(a)(b);
}
function A3(fun, a, b, c)
{
  return fun.arity === 3
    ? fun.func(a, b, c)
    : fun(a)(b)(c);
}
function A4(fun, a, b, c, d)
{
  return fun.arity === 4
    ? fun.func(a, b, c, d)
    : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e)
{
  return fun.arity === 5
    ? fun.func(a, b, c, d, e)
    : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f)
{
  return fun.arity === 6
    ? fun.func(a, b, c, d, e, f)
    : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g)
{
  return fun.arity === 7
    ? fun.func(a, b, c, d, e, f, g)
    : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h)
{
  return fun.arity === 8
    ? fun.func(a, b, c, d, e, f, g, h)
    : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i)
{
  return fun.arity === 9
    ? fun.func(a, b, c, d, e, f, g, h, i)
    : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

//import Native.List //

var _elm_lang$core$Native_Array = function() {

// A RRB-Tree has two distinct data types.
// Leaf -> "height"  is always 0
//         "table"   is an array of elements
// Node -> "height"  is always greater than 0
//         "table"   is an array of child nodes
//         "lengths" is an array of accumulated lengths of the child nodes

// M is the maximal table size. 32 seems fast. E is the allowed increase
// of search steps when concatting to find an index. Lower values will
// decrease balancing, but will increase search steps.
var M = 32;
var E = 2;

// An empty array.
var empty = {
	ctor: '_Array',
	height: 0,
	table: []
};


function get(i, array)
{
	if (i < 0 || i >= length(array))
	{
		throw new Error(
			'Index ' + i + ' is out of range. Check the length of ' +
			'your array first or use getMaybe or getWithDefault.');
	}
	return unsafeGet(i, array);
}


function unsafeGet(i, array)
{
	for (var x = array.height; x > 0; x--)
	{
		var slot = i >> (x * 5);
		while (array.lengths[slot] <= i)
		{
			slot++;
		}
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array = array.table[slot];
	}
	return array.table[i];
}


// Sets the value at the index i. Only the nodes leading to i will get
// copied and updated.
function set(i, item, array)
{
	if (i < 0 || length(array) <= i)
	{
		return array;
	}
	return unsafeSet(i, item, array);
}


function unsafeSet(i, item, array)
{
	array = nodeCopy(array);

	if (array.height === 0)
	{
		array.table[i] = item;
	}
	else
	{
		var slot = getSlot(i, array);
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array.table[slot] = unsafeSet(i, item, array.table[slot]);
	}
	return array;
}


function initialize(len, f)
{
	if (len <= 0)
	{
		return empty;
	}
	var h = Math.floor( Math.log(len) / Math.log(M) );
	return initialize_(f, h, 0, len);
}

function initialize_(f, h, from, to)
{
	if (h === 0)
	{
		var table = new Array((to - from) % (M + 1));
		for (var i = 0; i < table.length; i++)
		{
		  table[i] = f(from + i);
		}
		return {
			ctor: '_Array',
			height: 0,
			table: table
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = initialize_(f, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i-1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

function fromList(list)
{
	if (list.ctor === '[]')
	{
		return empty;
	}

	// Allocate M sized blocks (table) and write list elements to it.
	var table = new Array(M);
	var nodes = [];
	var i = 0;

	while (list.ctor !== '[]')
	{
		table[i] = list._0;
		list = list._1;
		i++;

		// table is full, so we can push a leaf containing it into the
		// next node.
		if (i === M)
		{
			var leaf = {
				ctor: '_Array',
				height: 0,
				table: table
			};
			fromListPush(leaf, nodes);
			table = new Array(M);
			i = 0;
		}
	}

	// Maybe there is something left on the table.
	if (i > 0)
	{
		var leaf = {
			ctor: '_Array',
			height: 0,
			table: table.splice(0, i)
		};
		fromListPush(leaf, nodes);
	}

	// Go through all of the nodes and eventually push them into higher nodes.
	for (var h = 0; h < nodes.length - 1; h++)
	{
		if (nodes[h].table.length > 0)
		{
			fromListPush(nodes[h], nodes);
		}
	}

	var head = nodes[nodes.length - 1];
	if (head.height > 0 && head.table.length === 1)
	{
		return head.table[0];
	}
	else
	{
		return head;
	}
}

// Push a node into a higher node as a child.
function fromListPush(toPush, nodes)
{
	var h = toPush.height;

	// Maybe the node on this height does not exist.
	if (nodes.length === h)
	{
		var node = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
		nodes.push(node);
	}

	nodes[h].table.push(toPush);
	var len = length(toPush);
	if (nodes[h].lengths.length > 0)
	{
		len += nodes[h].lengths[nodes[h].lengths.length - 1];
	}
	nodes[h].lengths.push(len);

	if (nodes[h].table.length === M)
	{
		fromListPush(nodes[h], nodes);
		nodes[h] = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
	}
}

// Pushes an item via push_ to the bottom right of a tree.
function push(item, a)
{
	var pushed = push_(item, a);
	if (pushed !== null)
	{
		return pushed;
	}

	var newTree = create(item, a.height);
	return siblise(a, newTree);
}

// Recursively tries to push an item to the bottom-right most
// tree possible. If there is no space left for the item,
// null will be returned.
function push_(item, a)
{
	// Handle resursion stop at leaf level.
	if (a.height === 0)
	{
		if (a.table.length < M)
		{
			var newA = {
				ctor: '_Array',
				height: 0,
				table: a.table.slice()
			};
			newA.table.push(item);
			return newA;
		}
		else
		{
		  return null;
		}
	}

	// Recursively push
	var pushed = push_(item, botRight(a));

	// There was space in the bottom right tree, so the slot will
	// be updated.
	if (pushed !== null)
	{
		var newA = nodeCopy(a);
		newA.table[newA.table.length - 1] = pushed;
		newA.lengths[newA.lengths.length - 1]++;
		return newA;
	}

	// When there was no space left, check if there is space left
	// for a new slot with a tree which contains only the item
	// at the bottom.
	if (a.table.length < M)
	{
		var newSlot = create(item, a.height - 1);
		var newA = nodeCopy(a);
		newA.table.push(newSlot);
		newA.lengths.push(newA.lengths[newA.lengths.length - 1] + length(newSlot));
		return newA;
	}
	else
	{
		return null;
	}
}

// Converts an array into a list of elements.
function toList(a)
{
	return toList_(_elm_lang$core$Native_List.Nil, a);
}

function toList_(list, a)
{
	for (var i = a.table.length - 1; i >= 0; i--)
	{
		list =
			a.height === 0
				? _elm_lang$core$Native_List.Cons(a.table[i], list)
				: toList_(list, a.table[i]);
	}
	return list;
}

// Maps a function over the elements of an array.
function map(f, a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? f(a.table[i])
				: map(f, a.table[i]);
	}
	return newA;
}

// Maps a function over the elements with their index as first argument.
function indexedMap(f, a)
{
	return indexedMap_(f, a, 0);
}

function indexedMap_(f, a, from)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? A2(f, from + i, a.table[i])
				: indexedMap_(f, a.table[i], i == 0 ? from : from + a.lengths[i - 1]);
	}
	return newA;
}

function foldl(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = foldl(f, b, a.table[i]);
		}
	}
	return b;
}

function foldr(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = a.table.length; i--; )
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = a.table.length; i--; )
		{
			b = foldr(f, b, a.table[i]);
		}
	}
	return b;
}

// TODO: currently, it slices the right, then the left. This can be
// optimized.
function slice(from, to, a)
{
	if (from < 0)
	{
		from += length(a);
	}
	if (to < 0)
	{
		to += length(a);
	}
	return sliceLeft(from, sliceRight(to, a));
}

function sliceRight(to, a)
{
	if (to === length(a))
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(0, to);
		return newA;
	}

	// Slice the right recursively.
	var right = getSlot(to, a);
	var sliced = sliceRight(to - (right > 0 ? a.lengths[right - 1] : 0), a.table[right]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (right === 0)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(0, right),
		lengths: a.lengths.slice(0, right)
	};
	if (sliced.table.length > 0)
	{
		newA.table[right] = sliced;
		newA.lengths[right] = length(sliced) + (right > 0 ? newA.lengths[right - 1] : 0);
	}
	return newA;
}

function sliceLeft(from, a)
{
	if (from === 0)
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(from, a.table.length + 1);
		return newA;
	}

	// Slice the left recursively.
	var left = getSlot(from, a);
	var sliced = sliceLeft(from - (left > 0 ? a.lengths[left - 1] : 0), a.table[left]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (left === a.table.length - 1)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(left, a.table.length + 1),
		lengths: new Array(a.table.length - left)
	};
	newA.table[0] = sliced;
	var len = 0;
	for (var i = 0; i < newA.table.length; i++)
	{
		len += length(newA.table[i]);
		newA.lengths[i] = len;
	}

	return newA;
}

// Appends two trees.
function append(a,b)
{
	if (a.table.length === 0)
	{
		return b;
	}
	if (b.table.length === 0)
	{
		return a;
	}

	var c = append_(a, b);

	// Check if both nodes can be crunshed together.
	if (c[0].table.length + c[1].table.length <= M)
	{
		if (c[0].table.length === 0)
		{
			return c[1];
		}
		if (c[1].table.length === 0)
		{
			return c[0];
		}

		// Adjust .table and .lengths
		c[0].table = c[0].table.concat(c[1].table);
		if (c[0].height > 0)
		{
			var len = length(c[0]);
			for (var i = 0; i < c[1].lengths.length; i++)
			{
				c[1].lengths[i] += len;
			}
			c[0].lengths = c[0].lengths.concat(c[1].lengths);
		}

		return c[0];
	}

	if (c[0].height > 0)
	{
		var toRemove = calcToRemove(a, b);
		if (toRemove > E)
		{
			c = shuffle(c[0], c[1], toRemove);
		}
	}

	return siblise(c[0], c[1]);
}

// Returns an array of two nodes; right and left. One node _may_ be empty.
function append_(a, b)
{
	if (a.height === 0 && b.height === 0)
	{
		return [a, b];
	}

	if (a.height !== 1 || b.height !== 1)
	{
		if (a.height === b.height)
		{
			a = nodeCopy(a);
			b = nodeCopy(b);
			var appended = append_(botRight(a), botLeft(b));

			insertRight(a, appended[1]);
			insertLeft(b, appended[0]);
		}
		else if (a.height > b.height)
		{
			a = nodeCopy(a);
			var appended = append_(botRight(a), b);

			insertRight(a, appended[0]);
			b = parentise(appended[1], appended[1].height + 1);
		}
		else
		{
			b = nodeCopy(b);
			var appended = append_(a, botLeft(b));

			var left = appended[0].table.length === 0 ? 0 : 1;
			var right = left === 0 ? 1 : 0;
			insertLeft(b, appended[left]);
			a = parentise(appended[right], appended[right].height + 1);
		}
	}

	// Check if balancing is needed and return based on that.
	if (a.table.length === 0 || b.table.length === 0)
	{
		return [a, b];
	}

	var toRemove = calcToRemove(a, b);
	if (toRemove <= E)
	{
		return [a, b];
	}
	return shuffle(a, b, toRemove);
}

// Helperfunctions for append_. Replaces a child node at the side of the parent.
function insertRight(parent, node)
{
	var index = parent.table.length - 1;
	parent.table[index] = node;
	parent.lengths[index] = length(node);
	parent.lengths[index] += index > 0 ? parent.lengths[index - 1] : 0;
}

function insertLeft(parent, node)
{
	if (node.table.length > 0)
	{
		parent.table[0] = node;
		parent.lengths[0] = length(node);

		var len = length(parent.table[0]);
		for (var i = 1; i < parent.lengths.length; i++)
		{
			len += length(parent.table[i]);
			parent.lengths[i] = len;
		}
	}
	else
	{
		parent.table.shift();
		for (var i = 1; i < parent.lengths.length; i++)
		{
			parent.lengths[i] = parent.lengths[i] - parent.lengths[0];
		}
		parent.lengths.shift();
	}
}

// Returns the extra search steps for E. Refer to the paper.
function calcToRemove(a, b)
{
	var subLengths = 0;
	for (var i = 0; i < a.table.length; i++)
	{
		subLengths += a.table[i].table.length;
	}
	for (var i = 0; i < b.table.length; i++)
	{
		subLengths += b.table[i].table.length;
	}

	var toRemove = a.table.length + b.table.length;
	return toRemove - (Math.floor((subLengths - 1) / M) + 1);
}

// get2, set2 and saveSlot are helpers for accessing elements over two arrays.
function get2(a, b, index)
{
	return index < a.length
		? a[index]
		: b[index - a.length];
}

function set2(a, b, index, value)
{
	if (index < a.length)
	{
		a[index] = value;
	}
	else
	{
		b[index - a.length] = value;
	}
}

function saveSlot(a, b, index, slot)
{
	set2(a.table, b.table, index, slot);

	var l = (index === 0 || index === a.lengths.length)
		? 0
		: get2(a.lengths, a.lengths, index - 1);

	set2(a.lengths, b.lengths, index, l + length(slot));
}

// Creates a node or leaf with a given length at their arrays for perfomance.
// Is only used by shuffle.
function createNode(h, length)
{
	if (length < 0)
	{
		length = 0;
	}
	var a = {
		ctor: '_Array',
		height: h,
		table: new Array(length)
	};
	if (h > 0)
	{
		a.lengths = new Array(length);
	}
	return a;
}

// Returns an array of two balanced nodes.
function shuffle(a, b, toRemove)
{
	var newA = createNode(a.height, Math.min(M, a.table.length + b.table.length - toRemove));
	var newB = createNode(a.height, newA.table.length - (a.table.length + b.table.length - toRemove));

	// Skip the slots with size M. More precise: copy the slot references
	// to the new node
	var read = 0;
	while (get2(a.table, b.table, read).table.length % M === 0)
	{
		set2(newA.table, newB.table, read, get2(a.table, b.table, read));
		set2(newA.lengths, newB.lengths, read, get2(a.lengths, b.lengths, read));
		read++;
	}

	// Pulling items from left to right, caching in a slot before writing
	// it into the new nodes.
	var write = read;
	var slot = new createNode(a.height - 1, 0);
	var from = 0;

	// If the current slot is still containing data, then there will be at
	// least one more write, so we do not break this loop yet.
	while (read - write - (slot.table.length > 0 ? 1 : 0) < toRemove)
	{
		// Find out the max possible items for copying.
		var source = get2(a.table, b.table, read);
		var to = Math.min(M - slot.table.length, source.table.length);

		// Copy and adjust size table.
		slot.table = slot.table.concat(source.table.slice(from, to));
		if (slot.height > 0)
		{
			var len = slot.lengths.length;
			for (var i = len; i < len + to - from; i++)
			{
				slot.lengths[i] = length(slot.table[i]);
				slot.lengths[i] += (i > 0 ? slot.lengths[i - 1] : 0);
			}
		}

		from += to;

		// Only proceed to next slots[i] if the current one was
		// fully copied.
		if (source.table.length <= to)
		{
			read++; from = 0;
		}

		// Only create a new slot if the current one is filled up.
		if (slot.table.length === M)
		{
			saveSlot(newA, newB, write, slot);
			slot = createNode(a.height - 1, 0);
			write++;
		}
	}

	// Cleanup after the loop. Copy the last slot into the new nodes.
	if (slot.table.length > 0)
	{
		saveSlot(newA, newB, write, slot);
		write++;
	}

	// Shift the untouched slots to the left
	while (read < a.table.length + b.table.length )
	{
		saveSlot(newA, newB, write, get2(a.table, b.table, read));
		read++;
		write++;
	}

	return [newA, newB];
}

// Navigation functions
function botRight(a)
{
	return a.table[a.table.length - 1];
}
function botLeft(a)
{
	return a.table[0];
}

// Copies a node for updating. Note that you should not use this if
// only updating only one of "table" or "lengths" for performance reasons.
function nodeCopy(a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice()
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths.slice();
	}
	return newA;
}

// Returns how many items are in the tree.
function length(array)
{
	if (array.height === 0)
	{
		return array.table.length;
	}
	else
	{
		return array.lengths[array.lengths.length - 1];
	}
}

// Calculates in which slot of "table" the item probably is, then
// find the exact slot via forward searching in  "lengths". Returns the index.
function getSlot(i, a)
{
	var slot = i >> (5 * a.height);
	while (a.lengths[slot] <= i)
	{
		slot++;
	}
	return slot;
}

// Recursively creates a tree with a given height containing
// only the given item.
function create(item, h)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: [item]
		};
	}
	return {
		ctor: '_Array',
		height: h,
		table: [create(item, h - 1)],
		lengths: [1]
	};
}

// Recursively creates a tree that contains the given tree.
function parentise(tree, h)
{
	if (h === tree.height)
	{
		return tree;
	}

	return {
		ctor: '_Array',
		height: h,
		table: [parentise(tree, h - 1)],
		lengths: [length(tree)]
	};
}

// Emphasizes blood brotherhood beneath two trees.
function siblise(a, b)
{
	return {
		ctor: '_Array',
		height: a.height + 1,
		table: [a, b],
		lengths: [length(a), length(a) + length(b)]
	};
}

function toJSArray(a)
{
	var jsArray = new Array(length(a));
	toJSArray_(jsArray, 0, a);
	return jsArray;
}

function toJSArray_(jsArray, i, a)
{
	for (var t = 0; t < a.table.length; t++)
	{
		if (a.height === 0)
		{
			jsArray[i + t] = a.table[t];
		}
		else
		{
			var inc = t === 0 ? 0 : a.lengths[t - 1];
			toJSArray_(jsArray, i + inc, a.table[t]);
		}
	}
}

function fromJSArray(jsArray)
{
	if (jsArray.length === 0)
	{
		return empty;
	}
	var h = Math.floor(Math.log(jsArray.length) / Math.log(M));
	return fromJSArray_(jsArray, h, 0, jsArray.length);
}

function fromJSArray_(jsArray, h, from, to)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: jsArray.slice(from, to)
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = fromJSArray_(jsArray, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i - 1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

return {
	empty: empty,
	fromList: fromList,
	toList: toList,
	initialize: F2(initialize),
	append: F2(append),
	push: F2(push),
	slice: F3(slice),
	get: F2(get),
	set: F3(set),
	map: F2(map),
	indexedMap: F2(indexedMap),
	foldl: F3(foldl),
	foldr: F3(foldr),
	length: length,

	toJSArray: toJSArray,
	fromJSArray: fromJSArray
};

}();
//import Native.Utils //

var _elm_lang$core$Native_Basics = function() {

function div(a, b)
{
	return (a / b) | 0;
}
function rem(a, b)
{
	return a % b;
}
function mod(a, b)
{
	if (b === 0)
	{
		throw new Error('Cannot perform mod 0. Division by zero error.');
	}
	var r = a % b;
	var m = a === 0 ? 0 : (b > 0 ? (a >= 0 ? r : r + b) : -mod(-a, -b));

	return m === b ? 0 : m;
}
function logBase(base, n)
{
	return Math.log(n) / Math.log(base);
}
function negate(n)
{
	return -n;
}
function abs(n)
{
	return n < 0 ? -n : n;
}

function min(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) < 0 ? a : b;
}
function max(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) > 0 ? a : b;
}
function clamp(lo, hi, n)
{
	return _elm_lang$core$Native_Utils.cmp(n, lo) < 0
		? lo
		: _elm_lang$core$Native_Utils.cmp(n, hi) > 0
			? hi
			: n;
}

var ord = ['LT', 'EQ', 'GT'];

function compare(x, y)
{
	return { ctor: ord[_elm_lang$core$Native_Utils.cmp(x, y) + 1] };
}

function xor(a, b)
{
	return a !== b;
}
function not(b)
{
	return !b;
}
function isInfinite(n)
{
	return n === Infinity || n === -Infinity;
}

function truncate(n)
{
	return n | 0;
}

function degrees(d)
{
	return d * Math.PI / 180;
}
function turns(t)
{
	return 2 * Math.PI * t;
}
function fromPolar(point)
{
	var r = point._0;
	var t = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(r * Math.cos(t), r * Math.sin(t));
}
function toPolar(point)
{
	var x = point._0;
	var y = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(Math.sqrt(x * x + y * y), Math.atan2(y, x));
}

return {
	div: F2(div),
	rem: F2(rem),
	mod: F2(mod),

	pi: Math.PI,
	e: Math.E,
	cos: Math.cos,
	sin: Math.sin,
	tan: Math.tan,
	acos: Math.acos,
	asin: Math.asin,
	atan: Math.atan,
	atan2: F2(Math.atan2),

	degrees: degrees,
	turns: turns,
	fromPolar: fromPolar,
	toPolar: toPolar,

	sqrt: Math.sqrt,
	logBase: F2(logBase),
	negate: negate,
	abs: abs,
	min: F2(min),
	max: F2(max),
	clamp: F3(clamp),
	compare: F2(compare),

	xor: F2(xor),
	not: not,

	truncate: truncate,
	ceiling: Math.ceil,
	floor: Math.floor,
	round: Math.round,
	toFloat: function(x) { return x; },
	isNaN: isNaN,
	isInfinite: isInfinite
};

}();
//import //

var _elm_lang$core$Native_Utils = function() {

// COMPARISONS

function eq(x, y)
{
	var stack = [];
	var isEqual = eqHelp(x, y, 0, stack);
	var pair;
	while (isEqual && (pair = stack.pop()))
	{
		isEqual = eqHelp(pair.x, pair.y, 0, stack);
	}
	return isEqual;
}


function eqHelp(x, y, depth, stack)
{
	if (depth > 100)
	{
		stack.push({ x: x, y: y });
		return true;
	}

	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object')
	{
		if (typeof x === 'function')
		{
			throw new Error(
				'Trying to use `(==)` on functions. There is no way to know if functions are "the same" in the Elm sense.'
				+ ' Read more about this at http://package.elm-lang.org/packages/elm-lang/core/latest/Basics#=='
				+ ' which describes why it is this way and what the better version will look like.'
			);
		}
		return false;
	}

	if (x === null || y === null)
	{
		return false
	}

	if (x instanceof Date)
	{
		return x.getTime() === y.getTime();
	}

	if (!('ctor' in x))
	{
		for (var key in x)
		{
			if (!eqHelp(x[key], y[key], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	// convert Dicts and Sets to lists
	if (x.ctor === 'RBNode_elm_builtin' || x.ctor === 'RBEmpty_elm_builtin')
	{
		x = _elm_lang$core$Dict$toList(x);
		y = _elm_lang$core$Dict$toList(y);
	}
	if (x.ctor === 'Set_elm_builtin')
	{
		x = _elm_lang$core$Set$toList(x);
		y = _elm_lang$core$Set$toList(y);
	}

	// check if lists are equal without recursion
	if (x.ctor === '::')
	{
		var a = x;
		var b = y;
		while (a.ctor === '::' && b.ctor === '::')
		{
			if (!eqHelp(a._0, b._0, depth + 1, stack))
			{
				return false;
			}
			a = a._1;
			b = b._1;
		}
		return a.ctor === b.ctor;
	}

	// check if Arrays are equal
	if (x.ctor === '_Array')
	{
		var xs = _elm_lang$core$Native_Array.toJSArray(x);
		var ys = _elm_lang$core$Native_Array.toJSArray(y);
		if (xs.length !== ys.length)
		{
			return false;
		}
		for (var i = 0; i < xs.length; i++)
		{
			if (!eqHelp(xs[i], ys[i], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	if (!eqHelp(x.ctor, y.ctor, depth + 1, stack))
	{
		return false;
	}

	for (var key in x)
	{
		if (!eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

var LT = -1, EQ = 0, GT = 1;

function cmp(x, y)
{
	if (typeof x !== 'object')
	{
		return x === y ? EQ : x < y ? LT : GT;
	}

	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? EQ : a < b ? LT : GT;
	}

	if (x.ctor === '::' || x.ctor === '[]')
	{
		while (x.ctor === '::' && y.ctor === '::')
		{
			var ord = cmp(x._0, y._0);
			if (ord !== EQ)
			{
				return ord;
			}
			x = x._1;
			y = y._1;
		}
		return x.ctor === y.ctor ? EQ : x.ctor === '[]' ? LT : GT;
	}

	if (x.ctor.slice(0, 6) === '_Tuple')
	{
		var ord;
		var n = x.ctor.slice(6) - 0;
		var err = 'cannot compare tuples with more than 6 elements.';
		if (n === 0) return EQ;
		if (n >= 1) { ord = cmp(x._0, y._0); if (ord !== EQ) return ord;
		if (n >= 2) { ord = cmp(x._1, y._1); if (ord !== EQ) return ord;
		if (n >= 3) { ord = cmp(x._2, y._2); if (ord !== EQ) return ord;
		if (n >= 4) { ord = cmp(x._3, y._3); if (ord !== EQ) return ord;
		if (n >= 5) { ord = cmp(x._4, y._4); if (ord !== EQ) return ord;
		if (n >= 6) { ord = cmp(x._5, y._5); if (ord !== EQ) return ord;
		if (n >= 7) throw new Error('Comparison error: ' + err); } } } } } }
		return EQ;
	}

	throw new Error(
		'Comparison error: comparison is only defined on ints, '
		+ 'floats, times, chars, strings, lists of comparable values, '
		+ 'and tuples of comparable values.'
	);
}


// COMMON VALUES

var Tuple0 = {
	ctor: '_Tuple0'
};

function Tuple2(x, y)
{
	return {
		ctor: '_Tuple2',
		_0: x,
		_1: y
	};
}

function chr(c)
{
	return new String(c);
}


// GUID

var count = 0;
function guid(_)
{
	return count++;
}


// RECORDS

function update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


//// LIST STUFF ////

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return {
		ctor: '::',
		_0: hd,
		_1: tl
	};
}

function append(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (xs.ctor === '[]')
	{
		return ys;
	}
	var root = Cons(xs._0, Nil);
	var curr = root;
	xs = xs._1;
	while (xs.ctor !== '[]')
	{
		curr._1 = Cons(xs._0, Nil);
		xs = xs._1;
		curr = curr._1;
	}
	curr._1 = ys;
	return root;
}


// CRASHES

function crash(moduleName, region)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '` ' + regionToString(region) + '\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function crashCase(moduleName, region, value)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '`\n\n'
			+ 'This was caused by the `case` expression ' + regionToString(region) + '.\n'
			+ 'One of the branches ended with a crash and the following value got through:\n\n    ' + toString(value) + '\n\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function regionToString(region)
{
	if (region.start.line == region.end.line)
	{
		return 'on line ' + region.start.line;
	}
	return 'between lines ' + region.start.line + ' and ' + region.end.line;
}


// TO STRING

function toString(v)
{
	var type = typeof v;
	if (type === 'function')
	{
		return '<function>';
	}

	if (type === 'boolean')
	{
		return v ? 'True' : 'False';
	}

	if (type === 'number')
	{
		return v + '';
	}

	if (v instanceof String)
	{
		return '\'' + addSlashes(v, true) + '\'';
	}

	if (type === 'string')
	{
		return '"' + addSlashes(v, false) + '"';
	}

	if (v === null)
	{
		return 'null';
	}

	if (type === 'object' && 'ctor' in v)
	{
		var ctorStarter = v.ctor.substring(0, 5);

		if (ctorStarter === '_Tupl')
		{
			var output = [];
			for (var k in v)
			{
				if (k === 'ctor') continue;
				output.push(toString(v[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (ctorStarter === '_Task')
		{
			return '<task>'
		}

		if (v.ctor === '_Array')
		{
			var list = _elm_lang$core$Array$toList(v);
			return 'Array.fromList ' + toString(list);
		}

		if (v.ctor === '<decoder>')
		{
			return '<decoder>';
		}

		if (v.ctor === '_Process')
		{
			return '<process:' + v.id + '>';
		}

		if (v.ctor === '::')
		{
			var output = '[' + toString(v._0);
			v = v._1;
			while (v.ctor === '::')
			{
				output += ',' + toString(v._0);
				v = v._1;
			}
			return output + ']';
		}

		if (v.ctor === '[]')
		{
			return '[]';
		}

		if (v.ctor === 'Set_elm_builtin')
		{
			return 'Set.fromList ' + toString(_elm_lang$core$Set$toList(v));
		}

		if (v.ctor === 'RBNode_elm_builtin' || v.ctor === 'RBEmpty_elm_builtin')
		{
			return 'Dict.fromList ' + toString(_elm_lang$core$Dict$toList(v));
		}

		var output = '';
		for (var i in v)
		{
			if (i === 'ctor') continue;
			var str = toString(v[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return v.ctor + output;
	}

	if (type === 'object')
	{
		if (v instanceof Date)
		{
			return '<' + v.toString() + '>';
		}

		if (v.elm_web_socket)
		{
			return '<websocket>';
		}

		var output = [];
		for (var k in v)
		{
			output.push(k + ' = ' + toString(v[k]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return '<internal structure>';
}

function addSlashes(str, isChar)
{
	var s = str.replace(/\\/g, '\\\\')
			  .replace(/\n/g, '\\n')
			  .replace(/\t/g, '\\t')
			  .replace(/\r/g, '\\r')
			  .replace(/\v/g, '\\v')
			  .replace(/\0/g, '\\0');
	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}


return {
	eq: eq,
	cmp: cmp,
	Tuple0: Tuple0,
	Tuple2: Tuple2,
	chr: chr,
	update: update,
	guid: guid,

	append: F2(append),

	crash: crash,
	crashCase: crashCase,

	toString: toString
};

}();
var _elm_lang$core$Basics$never = function (_p0) {
	never:
	while (true) {
		var _p1 = _p0;
		var _v1 = _p1._0;
		_p0 = _v1;
		continue never;
	}
};
var _elm_lang$core$Basics$uncurry = F2(
	function (f, _p2) {
		var _p3 = _p2;
		return A2(f, _p3._0, _p3._1);
	});
var _elm_lang$core$Basics$curry = F3(
	function (f, a, b) {
		return f(
			{ctor: '_Tuple2', _0: a, _1: b});
	});
var _elm_lang$core$Basics$flip = F3(
	function (f, b, a) {
		return A2(f, a, b);
	});
var _elm_lang$core$Basics$always = F2(
	function (a, _p4) {
		return a;
	});
var _elm_lang$core$Basics$identity = function (x) {
	return x;
};
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<|'] = F2(
	function (f, x) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['|>'] = F2(
	function (x, f) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>>'] = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<<'] = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['++'] = _elm_lang$core$Native_Utils.append;
var _elm_lang$core$Basics$toString = _elm_lang$core$Native_Utils.toString;
var _elm_lang$core$Basics$isInfinite = _elm_lang$core$Native_Basics.isInfinite;
var _elm_lang$core$Basics$isNaN = _elm_lang$core$Native_Basics.isNaN;
var _elm_lang$core$Basics$toFloat = _elm_lang$core$Native_Basics.toFloat;
var _elm_lang$core$Basics$ceiling = _elm_lang$core$Native_Basics.ceiling;
var _elm_lang$core$Basics$floor = _elm_lang$core$Native_Basics.floor;
var _elm_lang$core$Basics$truncate = _elm_lang$core$Native_Basics.truncate;
var _elm_lang$core$Basics$round = _elm_lang$core$Native_Basics.round;
var _elm_lang$core$Basics$not = _elm_lang$core$Native_Basics.not;
var _elm_lang$core$Basics$xor = _elm_lang$core$Native_Basics.xor;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['||'] = _elm_lang$core$Native_Basics.or;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['&&'] = _elm_lang$core$Native_Basics.and;
var _elm_lang$core$Basics$max = _elm_lang$core$Native_Basics.max;
var _elm_lang$core$Basics$min = _elm_lang$core$Native_Basics.min;
var _elm_lang$core$Basics$compare = _elm_lang$core$Native_Basics.compare;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>='] = _elm_lang$core$Native_Basics.ge;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<='] = _elm_lang$core$Native_Basics.le;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>'] = _elm_lang$core$Native_Basics.gt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<'] = _elm_lang$core$Native_Basics.lt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/='] = _elm_lang$core$Native_Basics.neq;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['=='] = _elm_lang$core$Native_Basics.eq;
var _elm_lang$core$Basics$e = _elm_lang$core$Native_Basics.e;
var _elm_lang$core$Basics$pi = _elm_lang$core$Native_Basics.pi;
var _elm_lang$core$Basics$clamp = _elm_lang$core$Native_Basics.clamp;
var _elm_lang$core$Basics$logBase = _elm_lang$core$Native_Basics.logBase;
var _elm_lang$core$Basics$abs = _elm_lang$core$Native_Basics.abs;
var _elm_lang$core$Basics$negate = _elm_lang$core$Native_Basics.negate;
var _elm_lang$core$Basics$sqrt = _elm_lang$core$Native_Basics.sqrt;
var _elm_lang$core$Basics$atan2 = _elm_lang$core$Native_Basics.atan2;
var _elm_lang$core$Basics$atan = _elm_lang$core$Native_Basics.atan;
var _elm_lang$core$Basics$asin = _elm_lang$core$Native_Basics.asin;
var _elm_lang$core$Basics$acos = _elm_lang$core$Native_Basics.acos;
var _elm_lang$core$Basics$tan = _elm_lang$core$Native_Basics.tan;
var _elm_lang$core$Basics$sin = _elm_lang$core$Native_Basics.sin;
var _elm_lang$core$Basics$cos = _elm_lang$core$Native_Basics.cos;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['^'] = _elm_lang$core$Native_Basics.exp;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['%'] = _elm_lang$core$Native_Basics.mod;
var _elm_lang$core$Basics$rem = _elm_lang$core$Native_Basics.rem;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['//'] = _elm_lang$core$Native_Basics.div;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/'] = _elm_lang$core$Native_Basics.floatDiv;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['*'] = _elm_lang$core$Native_Basics.mul;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['-'] = _elm_lang$core$Native_Basics.sub;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['+'] = _elm_lang$core$Native_Basics.add;
var _elm_lang$core$Basics$toPolar = _elm_lang$core$Native_Basics.toPolar;
var _elm_lang$core$Basics$fromPolar = _elm_lang$core$Native_Basics.fromPolar;
var _elm_lang$core$Basics$turns = _elm_lang$core$Native_Basics.turns;
var _elm_lang$core$Basics$degrees = _elm_lang$core$Native_Basics.degrees;
var _elm_lang$core$Basics$radians = function (t) {
	return t;
};
var _elm_lang$core$Basics$GT = {ctor: 'GT'};
var _elm_lang$core$Basics$EQ = {ctor: 'EQ'};
var _elm_lang$core$Basics$LT = {ctor: 'LT'};
var _elm_lang$core$Basics$JustOneMore = function (a) {
	return {ctor: 'JustOneMore', _0: a};
};

var _elm_lang$core$Maybe$withDefault = F2(
	function ($default, maybe) {
		var _p0 = maybe;
		if (_p0.ctor === 'Just') {
			return _p0._0;
		} else {
			return $default;
		}
	});
var _elm_lang$core$Maybe$Nothing = {ctor: 'Nothing'};
var _elm_lang$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		var _p1 = maybeValue;
		if (_p1.ctor === 'Just') {
			return callback(_p1._0);
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$Just = function (a) {
	return {ctor: 'Just', _0: a};
};
var _elm_lang$core$Maybe$map = F2(
	function (f, maybe) {
		var _p2 = maybe;
		if (_p2.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				f(_p2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map2 = F3(
	function (func, ma, mb) {
		var _p3 = {ctor: '_Tuple2', _0: ma, _1: mb};
		if (((_p3.ctor === '_Tuple2') && (_p3._0.ctor === 'Just')) && (_p3._1.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A2(func, _p3._0._0, _p3._1._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map3 = F4(
	function (func, ma, mb, mc) {
		var _p4 = {ctor: '_Tuple3', _0: ma, _1: mb, _2: mc};
		if ((((_p4.ctor === '_Tuple3') && (_p4._0.ctor === 'Just')) && (_p4._1.ctor === 'Just')) && (_p4._2.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A3(func, _p4._0._0, _p4._1._0, _p4._2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map4 = F5(
	function (func, ma, mb, mc, md) {
		var _p5 = {ctor: '_Tuple4', _0: ma, _1: mb, _2: mc, _3: md};
		if (((((_p5.ctor === '_Tuple4') && (_p5._0.ctor === 'Just')) && (_p5._1.ctor === 'Just')) && (_p5._2.ctor === 'Just')) && (_p5._3.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A4(func, _p5._0._0, _p5._1._0, _p5._2._0, _p5._3._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map5 = F6(
	function (func, ma, mb, mc, md, me) {
		var _p6 = {ctor: '_Tuple5', _0: ma, _1: mb, _2: mc, _3: md, _4: me};
		if ((((((_p6.ctor === '_Tuple5') && (_p6._0.ctor === 'Just')) && (_p6._1.ctor === 'Just')) && (_p6._2.ctor === 'Just')) && (_p6._3.ctor === 'Just')) && (_p6._4.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A5(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0, _p6._4._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});

//import Native.Utils //

var _elm_lang$core$Native_List = function() {

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return { ctor: '::', _0: hd, _1: tl };
}

function fromArray(arr)
{
	var out = Nil;
	for (var i = arr.length; i--; )
	{
		out = Cons(arr[i], out);
	}
	return out;
}

function toArray(xs)
{
	var out = [];
	while (xs.ctor !== '[]')
	{
		out.push(xs._0);
		xs = xs._1;
	}
	return out;
}

function foldr(f, b, xs)
{
	var arr = toArray(xs);
	var acc = b;
	for (var i = arr.length; i--; )
	{
		acc = A2(f, arr[i], acc);
	}
	return acc;
}

function map2(f, xs, ys)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]')
	{
		arr.push(A2(f, xs._0, ys._0));
		xs = xs._1;
		ys = ys._1;
	}
	return fromArray(arr);
}

function map3(f, xs, ys, zs)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]' && zs.ctor !== '[]')
	{
		arr.push(A3(f, xs._0, ys._0, zs._0));
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map4(f, ws, xs, ys, zs)
{
	var arr = [];
	while (   ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A4(f, ws._0, xs._0, ys._0, zs._0));
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map5(f, vs, ws, xs, ys, zs)
{
	var arr = [];
	while (   vs.ctor !== '[]'
		   && ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A5(f, vs._0, ws._0, xs._0, ys._0, zs._0));
		vs = vs._1;
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function sortBy(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		return _elm_lang$core$Native_Utils.cmp(f(a), f(b));
	}));
}

function sortWith(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		var ord = f(a)(b).ctor;
		return ord === 'EQ' ? 0 : ord === 'LT' ? -1 : 1;
	}));
}

return {
	Nil: Nil,
	Cons: Cons,
	cons: F2(Cons),
	toArray: toArray,
	fromArray: fromArray,

	foldr: F3(foldr),

	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	sortBy: F2(sortBy),
	sortWith: F2(sortWith)
};

}();
var _elm_lang$core$List$sortWith = _elm_lang$core$Native_List.sortWith;
var _elm_lang$core$List$sortBy = _elm_lang$core$Native_List.sortBy;
var _elm_lang$core$List$sort = function (xs) {
	return A2(_elm_lang$core$List$sortBy, _elm_lang$core$Basics$identity, xs);
};
var _elm_lang$core$List$singleton = function (value) {
	return {
		ctor: '::',
		_0: value,
		_1: {ctor: '[]'}
	};
};
var _elm_lang$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return list;
			} else {
				var _p0 = list;
				if (_p0.ctor === '[]') {
					return list;
				} else {
					var _v1 = n - 1,
						_v2 = _p0._1;
					n = _v1;
					list = _v2;
					continue drop;
				}
			}
		}
	});
var _elm_lang$core$List$map5 = _elm_lang$core$Native_List.map5;
var _elm_lang$core$List$map4 = _elm_lang$core$Native_List.map4;
var _elm_lang$core$List$map3 = _elm_lang$core$Native_List.map3;
var _elm_lang$core$List$map2 = _elm_lang$core$Native_List.map2;
var _elm_lang$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			var _p1 = list;
			if (_p1.ctor === '[]') {
				return false;
			} else {
				if (isOkay(_p1._0)) {
					return true;
				} else {
					var _v4 = isOkay,
						_v5 = _p1._1;
					isOkay = _v4;
					list = _v5;
					continue any;
				}
			}
		}
	});
var _elm_lang$core$List$all = F2(
	function (isOkay, list) {
		return !A2(
			_elm_lang$core$List$any,
			function (_p2) {
				return !isOkay(_p2);
			},
			list);
	});
var _elm_lang$core$List$foldr = _elm_lang$core$Native_List.foldr;
var _elm_lang$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			var _p3 = list;
			if (_p3.ctor === '[]') {
				return acc;
			} else {
				var _v7 = func,
					_v8 = A2(func, _p3._0, acc),
					_v9 = _p3._1;
				func = _v7;
				acc = _v8;
				list = _v9;
				continue foldl;
			}
		}
	});
var _elm_lang$core$List$length = function (xs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p4, i) {
				return i + 1;
			}),
		0,
		xs);
};
var _elm_lang$core$List$sum = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x + y;
			}),
		0,
		numbers);
};
var _elm_lang$core$List$product = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x * y;
			}),
		1,
		numbers);
};
var _elm_lang$core$List$maximum = function (list) {
	var _p5 = list;
	if (_p5.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$max, _p5._0, _p5._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$minimum = function (list) {
	var _p6 = list;
	if (_p6.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$min, _p6._0, _p6._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$member = F2(
	function (x, xs) {
		return A2(
			_elm_lang$core$List$any,
			function (a) {
				return _elm_lang$core$Native_Utils.eq(a, x);
			},
			xs);
	});
var _elm_lang$core$List$isEmpty = function (xs) {
	var _p7 = xs;
	if (_p7.ctor === '[]') {
		return true;
	} else {
		return false;
	}
};
var _elm_lang$core$List$tail = function (list) {
	var _p8 = list;
	if (_p8.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p8._1);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$head = function (list) {
	var _p9 = list;
	if (_p9.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p9._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List_ops = _elm_lang$core$List_ops || {};
_elm_lang$core$List_ops['::'] = _elm_lang$core$Native_List.cons;
var _elm_lang$core$List$map = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			F2(
				function (x, acc) {
					return {
						ctor: '::',
						_0: f(x),
						_1: acc
					};
				}),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$filter = F2(
	function (pred, xs) {
		var conditionalCons = F2(
			function (front, back) {
				return pred(front) ? {ctor: '::', _0: front, _1: back} : back;
			});
		return A3(
			_elm_lang$core$List$foldr,
			conditionalCons,
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _p10 = f(mx);
		if (_p10.ctor === 'Just') {
			return {ctor: '::', _0: _p10._0, _1: xs};
		} else {
			return xs;
		}
	});
var _elm_lang$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			_elm_lang$core$List$maybeCons(f),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$reverse = function (list) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return {ctor: '::', _0: x, _1: y};
			}),
		{ctor: '[]'},
		list);
};
var _elm_lang$core$List$scanl = F3(
	function (f, b, xs) {
		var scan1 = F2(
			function (x, accAcc) {
				var _p11 = accAcc;
				if (_p11.ctor === '::') {
					return {
						ctor: '::',
						_0: A2(f, x, _p11._0),
						_1: accAcc
					};
				} else {
					return {ctor: '[]'};
				}
			});
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$foldl,
				scan1,
				{
					ctor: '::',
					_0: b,
					_1: {ctor: '[]'}
				},
				xs));
	});
var _elm_lang$core$List$append = F2(
	function (xs, ys) {
		var _p12 = ys;
		if (_p12.ctor === '[]') {
			return xs;
		} else {
			return A3(
				_elm_lang$core$List$foldr,
				F2(
					function (x, y) {
						return {ctor: '::', _0: x, _1: y};
					}),
				ys,
				xs);
		}
	});
var _elm_lang$core$List$concat = function (lists) {
	return A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$List$append,
		{ctor: '[]'},
		lists);
};
var _elm_lang$core$List$concatMap = F2(
	function (f, list) {
		return _elm_lang$core$List$concat(
			A2(_elm_lang$core$List$map, f, list));
	});
var _elm_lang$core$List$partition = F2(
	function (pred, list) {
		var step = F2(
			function (x, _p13) {
				var _p14 = _p13;
				var _p16 = _p14._0;
				var _p15 = _p14._1;
				return pred(x) ? {
					ctor: '_Tuple2',
					_0: {ctor: '::', _0: x, _1: _p16},
					_1: _p15
				} : {
					ctor: '_Tuple2',
					_0: _p16,
					_1: {ctor: '::', _0: x, _1: _p15}
				};
			});
		return A3(
			_elm_lang$core$List$foldr,
			step,
			{
				ctor: '_Tuple2',
				_0: {ctor: '[]'},
				_1: {ctor: '[]'}
			},
			list);
	});
var _elm_lang$core$List$unzip = function (pairs) {
	var step = F2(
		function (_p18, _p17) {
			var _p19 = _p18;
			var _p20 = _p17;
			return {
				ctor: '_Tuple2',
				_0: {ctor: '::', _0: _p19._0, _1: _p20._0},
				_1: {ctor: '::', _0: _p19._1, _1: _p20._1}
			};
		});
	return A3(
		_elm_lang$core$List$foldr,
		step,
		{
			ctor: '_Tuple2',
			_0: {ctor: '[]'},
			_1: {ctor: '[]'}
		},
		pairs);
};
var _elm_lang$core$List$intersperse = F2(
	function (sep, xs) {
		var _p21 = xs;
		if (_p21.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var step = F2(
				function (x, rest) {
					return {
						ctor: '::',
						_0: sep,
						_1: {ctor: '::', _0: x, _1: rest}
					};
				});
			var spersed = A3(
				_elm_lang$core$List$foldr,
				step,
				{ctor: '[]'},
				_p21._1);
			return {ctor: '::', _0: _p21._0, _1: spersed};
		}
	});
var _elm_lang$core$List$takeReverse = F3(
	function (n, list, taken) {
		takeReverse:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return taken;
			} else {
				var _p22 = list;
				if (_p22.ctor === '[]') {
					return taken;
				} else {
					var _v23 = n - 1,
						_v24 = _p22._1,
						_v25 = {ctor: '::', _0: _p22._0, _1: taken};
					n = _v23;
					list = _v24;
					taken = _v25;
					continue takeReverse;
				}
			}
		}
	});
var _elm_lang$core$List$takeTailRec = F2(
	function (n, list) {
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$takeReverse,
				n,
				list,
				{ctor: '[]'}));
	});
var _elm_lang$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
			return {ctor: '[]'};
		} else {
			var _p23 = {ctor: '_Tuple2', _0: n, _1: list};
			_v26_5:
			do {
				_v26_1:
				do {
					if (_p23.ctor === '_Tuple2') {
						if (_p23._1.ctor === '[]') {
							return list;
						} else {
							if (_p23._1._1.ctor === '::') {
								switch (_p23._0) {
									case 1:
										break _v26_1;
									case 2:
										return {
											ctor: '::',
											_0: _p23._1._0,
											_1: {
												ctor: '::',
												_0: _p23._1._1._0,
												_1: {ctor: '[]'}
											}
										};
									case 3:
										if (_p23._1._1._1.ctor === '::') {
											return {
												ctor: '::',
												_0: _p23._1._0,
												_1: {
													ctor: '::',
													_0: _p23._1._1._0,
													_1: {
														ctor: '::',
														_0: _p23._1._1._1._0,
														_1: {ctor: '[]'}
													}
												}
											};
										} else {
											break _v26_5;
										}
									default:
										if ((_p23._1._1._1.ctor === '::') && (_p23._1._1._1._1.ctor === '::')) {
											var _p28 = _p23._1._1._1._0;
											var _p27 = _p23._1._1._0;
											var _p26 = _p23._1._0;
											var _p25 = _p23._1._1._1._1._0;
											var _p24 = _p23._1._1._1._1._1;
											return (_elm_lang$core$Native_Utils.cmp(ctr, 1000) > 0) ? {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A2(_elm_lang$core$List$takeTailRec, n - 4, _p24)
														}
													}
												}
											} : {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A3(_elm_lang$core$List$takeFast, ctr + 1, n - 4, _p24)
														}
													}
												}
											};
										} else {
											break _v26_5;
										}
								}
							} else {
								if (_p23._0 === 1) {
									break _v26_1;
								} else {
									break _v26_5;
								}
							}
						}
					} else {
						break _v26_5;
					}
				} while(false);
				return {
					ctor: '::',
					_0: _p23._1._0,
					_1: {ctor: '[]'}
				};
			} while(false);
			return list;
		}
	});
var _elm_lang$core$List$take = F2(
	function (n, list) {
		return A3(_elm_lang$core$List$takeFast, 0, n, list);
	});
var _elm_lang$core$List$repeatHelp = F3(
	function (result, n, value) {
		repeatHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return result;
			} else {
				var _v27 = {ctor: '::', _0: value, _1: result},
					_v28 = n - 1,
					_v29 = value;
				result = _v27;
				n = _v28;
				value = _v29;
				continue repeatHelp;
			}
		}
	});
var _elm_lang$core$List$repeat = F2(
	function (n, value) {
		return A3(
			_elm_lang$core$List$repeatHelp,
			{ctor: '[]'},
			n,
			value);
	});
var _elm_lang$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(lo, hi) < 1) {
				var _v30 = lo,
					_v31 = hi - 1,
					_v32 = {ctor: '::', _0: hi, _1: list};
				lo = _v30;
				hi = _v31;
				list = _v32;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var _elm_lang$core$List$range = F2(
	function (lo, hi) {
		return A3(
			_elm_lang$core$List$rangeHelp,
			lo,
			hi,
			{ctor: '[]'});
	});
var _elm_lang$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$map2,
			f,
			A2(
				_elm_lang$core$List$range,
				0,
				_elm_lang$core$List$length(xs) - 1),
			xs);
	});

var _elm_lang$core$Array$append = _elm_lang$core$Native_Array.append;
var _elm_lang$core$Array$length = _elm_lang$core$Native_Array.length;
var _elm_lang$core$Array$isEmpty = function (array) {
	return _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$Array$length(array),
		0);
};
var _elm_lang$core$Array$slice = _elm_lang$core$Native_Array.slice;
var _elm_lang$core$Array$set = _elm_lang$core$Native_Array.set;
var _elm_lang$core$Array$get = F2(
	function (i, array) {
		return ((_elm_lang$core$Native_Utils.cmp(0, i) < 1) && (_elm_lang$core$Native_Utils.cmp(
			i,
			_elm_lang$core$Native_Array.length(array)) < 0)) ? _elm_lang$core$Maybe$Just(
			A2(_elm_lang$core$Native_Array.get, i, array)) : _elm_lang$core$Maybe$Nothing;
	});
var _elm_lang$core$Array$push = _elm_lang$core$Native_Array.push;
var _elm_lang$core$Array$empty = _elm_lang$core$Native_Array.empty;
var _elm_lang$core$Array$filter = F2(
	function (isOkay, arr) {
		var update = F2(
			function (x, xs) {
				return isOkay(x) ? A2(_elm_lang$core$Native_Array.push, x, xs) : xs;
			});
		return A3(_elm_lang$core$Native_Array.foldl, update, _elm_lang$core$Native_Array.empty, arr);
	});
var _elm_lang$core$Array$foldr = _elm_lang$core$Native_Array.foldr;
var _elm_lang$core$Array$foldl = _elm_lang$core$Native_Array.foldl;
var _elm_lang$core$Array$indexedMap = _elm_lang$core$Native_Array.indexedMap;
var _elm_lang$core$Array$map = _elm_lang$core$Native_Array.map;
var _elm_lang$core$Array$toIndexedList = function (array) {
	return A3(
		_elm_lang$core$List$map2,
		F2(
			function (v0, v1) {
				return {ctor: '_Tuple2', _0: v0, _1: v1};
			}),
		A2(
			_elm_lang$core$List$range,
			0,
			_elm_lang$core$Native_Array.length(array) - 1),
		_elm_lang$core$Native_Array.toList(array));
};
var _elm_lang$core$Array$toList = _elm_lang$core$Native_Array.toList;
var _elm_lang$core$Array$fromList = _elm_lang$core$Native_Array.fromList;
var _elm_lang$core$Array$initialize = _elm_lang$core$Native_Array.initialize;
var _elm_lang$core$Array$repeat = F2(
	function (n, e) {
		return A2(
			_elm_lang$core$Array$initialize,
			n,
			_elm_lang$core$Basics$always(e));
	});
var _elm_lang$core$Array$Array = {ctor: 'Array'};

//import //

var _elm_lang$core$Native_Platform = function() {


// PROGRAMS

function program(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flags !== 'undefined')
				{
					throw new Error(
						'The `' + moduleName + '` module does not need flags.\n'
						+ 'Call ' + moduleName + '.worker() with no arguments and you should be all set!'
					);
				}

				return initialize(
					impl.init,
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function programWithFlags(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flagDecoder === 'undefined')
				{
					throw new Error(
						'Are you trying to sneak a Never value into Elm? Trickster!\n'
						+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
						+ 'Use `program` instead if you do not want flags.'
					);
				}

				var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
				if (result.ctor === 'Err')
				{
					throw new Error(
						moduleName + '.worker(...) was called with an unexpected argument.\n'
						+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
						+ result._0
					);
				}

				return initialize(
					impl.init(result._0),
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function renderer(enqueue, _)
{
	return function(_) {};
}


// HTML TO PROGRAM

function htmlToProgram(vnode)
{
	var emptyBag = batch(_elm_lang$core$Native_List.Nil);
	var noChange = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		emptyBag
	);

	return _elm_lang$virtual_dom$VirtualDom$program({
		init: noChange,
		view: function(model) { return main; },
		update: F2(function(msg, model) { return noChange; }),
		subscriptions: function (model) { return emptyBag; }
	});
}


// INITIALIZE A PROGRAM

function initialize(init, update, subscriptions, renderer)
{
	// ambient state
	var managers = {};
	var updateView;

	// init and update state in main process
	var initApp = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
		var model = init._0;
		updateView = renderer(enqueue, model);
		var cmds = init._1;
		var subs = subscriptions(model);
		dispatchEffects(managers, cmds, subs);
		callback(_elm_lang$core$Native_Scheduler.succeed(model));
	});

	function onMessage(msg, model)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
			var results = A2(update, msg, model);
			model = results._0;
			updateView(model);
			var cmds = results._1;
			var subs = subscriptions(model);
			dispatchEffects(managers, cmds, subs);
			callback(_elm_lang$core$Native_Scheduler.succeed(model));
		});
	}

	var mainProcess = spawnLoop(initApp, onMessage);

	function enqueue(msg)
	{
		_elm_lang$core$Native_Scheduler.rawSend(mainProcess, msg);
	}

	var ports = setupEffects(managers, enqueue);

	return ports ? { ports: ports } : {};
}


// EFFECT MANAGERS

var effectManagers = {};

function setupEffects(managers, callback)
{
	var ports;

	// setup all necessary effect managers
	for (var key in effectManagers)
	{
		var manager = effectManagers[key];

		if (manager.isForeign)
		{
			ports = ports || {};
			ports[key] = manager.tag === 'cmd'
				? setupOutgoingPort(key)
				: setupIncomingPort(key, callback);
		}

		managers[key] = makeManager(manager, callback);
	}

	return ports;
}

function makeManager(info, callback)
{
	var router = {
		main: callback,
		self: undefined
	};

	var tag = info.tag;
	var onEffects = info.onEffects;
	var onSelfMsg = info.onSelfMsg;

	function onMessage(msg, state)
	{
		if (msg.ctor === 'self')
		{
			return A3(onSelfMsg, router, msg._0, state);
		}

		var fx = msg._0;
		switch (tag)
		{
			case 'cmd':
				return A3(onEffects, router, fx.cmds, state);

			case 'sub':
				return A3(onEffects, router, fx.subs, state);

			case 'fx':
				return A4(onEffects, router, fx.cmds, fx.subs, state);
		}
	}

	var process = spawnLoop(info.init, onMessage);
	router.self = process;
	return process;
}

function sendToApp(router, msg)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		router.main(msg);
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sendToSelf(router, msg)
{
	return A2(_elm_lang$core$Native_Scheduler.send, router.self, {
		ctor: 'self',
		_0: msg
	});
}


// HELPER for STATEFUL LOOPS

function spawnLoop(init, onMessage)
{
	var andThen = _elm_lang$core$Native_Scheduler.andThen;

	function loop(state)
	{
		var handleMsg = _elm_lang$core$Native_Scheduler.receive(function(msg) {
			return onMessage(msg, state);
		});
		return A2(andThen, loop, handleMsg);
	}

	var task = A2(andThen, loop, init);

	return _elm_lang$core$Native_Scheduler.rawSpawn(task);
}


// BAGS

function leaf(home)
{
	return function(value)
	{
		return {
			type: 'leaf',
			home: home,
			value: value
		};
	};
}

function batch(list)
{
	return {
		type: 'node',
		branches: list
	};
}

function map(tagger, bag)
{
	return {
		type: 'map',
		tagger: tagger,
		tree: bag
	}
}


// PIPE BAGS INTO EFFECT MANAGERS

function dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	gatherEffects(true, cmdBag, effectsDict, null);
	gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		var fx = home in effectsDict
			? effectsDict[home]
			: {
				cmds: _elm_lang$core$Native_List.Nil,
				subs: _elm_lang$core$Native_List.Nil
			};

		_elm_lang$core$Native_Scheduler.rawSend(managers[home], { ctor: 'fx', _0: fx });
	}
}

function gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.type)
	{
		case 'leaf':
			var home = bag.home;
			var effect = toEffect(isCmd, home, taggers, bag.value);
			effectsDict[home] = insert(isCmd, effect, effectsDict[home]);
			return;

		case 'node':
			var list = bag.branches;
			while (list.ctor !== '[]')
			{
				gatherEffects(isCmd, list._0, effectsDict, taggers);
				list = list._1;
			}
			return;

		case 'map':
			gatherEffects(isCmd, bag.tree, effectsDict, {
				tagger: bag.tagger,
				rest: taggers
			});
			return;
	}
}

function toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		var temp = taggers;
		while (temp)
		{
			x = temp.tagger(x);
			temp = temp.rest;
		}
		return x;
	}

	var map = isCmd
		? effectManagers[home].cmdMap
		: effectManagers[home].subMap;

	return A2(map, applyTaggers, value)
}

function insert(isCmd, newEffect, effects)
{
	effects = effects || {
		cmds: _elm_lang$core$Native_List.Nil,
		subs: _elm_lang$core$Native_List.Nil
	};
	if (isCmd)
	{
		effects.cmds = _elm_lang$core$Native_List.Cons(newEffect, effects.cmds);
		return effects;
	}
	effects.subs = _elm_lang$core$Native_List.Cons(newEffect, effects.subs);
	return effects;
}


// PORTS

function checkPortName(name)
{
	if (name in effectManagers)
	{
		throw new Error('There can only be one port named `' + name + '`, but your program has multiple.');
	}
}


// OUTGOING PORTS

function outgoingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'cmd',
		cmdMap: outgoingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var outgoingPortMap = F2(function cmdMap(tagger, value) {
	return value;
});

function setupOutgoingPort(name)
{
	var subs = [];
	var converter = effectManagers[name].converter;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function onEffects(router, cmdList, state)
	{
		while (cmdList.ctor !== '[]')
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = converter(cmdList._0);
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
			cmdList = cmdList._1;
		}
		return init;
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}


// INCOMING PORTS

function incomingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'sub',
		subMap: incomingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var incomingPortMap = F2(function subMap(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});

function setupIncomingPort(name, callback)
{
	var sentBeforeInit = [];
	var subs = _elm_lang$core$Native_List.Nil;
	var converter = effectManagers[name].converter;
	var currentOnEffects = preInitOnEffects;
	var currentSend = preInitSend;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function preInitOnEffects(router, subList, state)
	{
		var postInitResult = postInitOnEffects(router, subList, state);

		for(var i = 0; i < sentBeforeInit.length; i++)
		{
			postInitSend(sentBeforeInit[i]);
		}

		sentBeforeInit = null; // to release objects held in queue
		currentSend = postInitSend;
		currentOnEffects = postInitOnEffects;
		return postInitResult;
	}

	function postInitOnEffects(router, subList, state)
	{
		subs = subList;
		return init;
	}

	function onEffects(router, subList, state)
	{
		return currentOnEffects(router, subList, state);
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function preInitSend(value)
	{
		sentBeforeInit.push(value);
	}

	function postInitSend(value)
	{
		var temp = subs;
		while (temp.ctor !== '[]')
		{
			callback(temp._0(value));
			temp = temp._1;
		}
	}

	function send(incomingValue)
	{
		var result = A2(_elm_lang$core$Json_Decode$decodeValue, converter, incomingValue);
		if (result.ctor === 'Err')
		{
			throw new Error('Trying to send an unexpected type of value through port `' + name + '`:\n' + result._0);
		}

		currentSend(result._0);
	}

	return { send: send };
}

return {
	// routers
	sendToApp: F2(sendToApp),
	sendToSelf: F2(sendToSelf),

	// global setup
	effectManagers: effectManagers,
	outgoingPort: outgoingPort,
	incomingPort: incomingPort,

	htmlToProgram: htmlToProgram,
	program: program,
	programWithFlags: programWithFlags,
	initialize: initialize,

	// effect bags
	leaf: leaf,
	batch: batch,
	map: F2(map)
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Scheduler = function() {

var MAX_STEPS = 10000;


// TASKS

function succeed(value)
{
	return {
		ctor: '_Task_succeed',
		value: value
	};
}

function fail(error)
{
	return {
		ctor: '_Task_fail',
		value: error
	};
}

function nativeBinding(callback)
{
	return {
		ctor: '_Task_nativeBinding',
		callback: callback,
		cancel: null
	};
}

function andThen(callback, task)
{
	return {
		ctor: '_Task_andThen',
		callback: callback,
		task: task
	};
}

function onError(callback, task)
{
	return {
		ctor: '_Task_onError',
		callback: callback,
		task: task
	};
}

function receive(callback)
{
	return {
		ctor: '_Task_receive',
		callback: callback
	};
}


// PROCESSES

function rawSpawn(task)
{
	var process = {
		ctor: '_Process',
		id: _elm_lang$core$Native_Utils.guid(),
		root: task,
		stack: null,
		mailbox: []
	};

	enqueue(process);

	return process;
}

function spawn(task)
{
	return nativeBinding(function(callback) {
		var process = rawSpawn(task);
		callback(succeed(process));
	});
}

function rawSend(process, msg)
{
	process.mailbox.push(msg);
	enqueue(process);
}

function send(process, msg)
{
	return nativeBinding(function(callback) {
		rawSend(process, msg);
		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function kill(process)
{
	return nativeBinding(function(callback) {
		var root = process.root;
		if (root.ctor === '_Task_nativeBinding' && root.cancel)
		{
			root.cancel();
		}

		process.root = null;

		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sleep(time)
{
	return nativeBinding(function(callback) {
		var id = setTimeout(function() {
			callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}


// STEP PROCESSES

function step(numSteps, process)
{
	while (numSteps < MAX_STEPS)
	{
		var ctor = process.root.ctor;

		if (ctor === '_Task_succeed')
		{
			while (process.stack && process.stack.ctor === '_Task_onError')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_fail')
		{
			while (process.stack && process.stack.ctor === '_Task_andThen')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_andThen')
		{
			process.stack = {
				ctor: '_Task_andThen',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_onError')
		{
			process.stack = {
				ctor: '_Task_onError',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_nativeBinding')
		{
			process.root.cancel = process.root.callback(function(newRoot) {
				process.root = newRoot;
				enqueue(process);
			});

			break;
		}

		if (ctor === '_Task_receive')
		{
			var mailbox = process.mailbox;
			if (mailbox.length === 0)
			{
				break;
			}

			process.root = process.root.callback(mailbox.shift());
			++numSteps;
			continue;
		}

		throw new Error(ctor);
	}

	if (numSteps < MAX_STEPS)
	{
		return numSteps + 1;
	}
	enqueue(process);

	return numSteps;
}


// WORK QUEUE

var working = false;
var workQueue = [];

function enqueue(process)
{
	workQueue.push(process);

	if (!working)
	{
		setTimeout(work, 0);
		working = true;
	}
}

function work()
{
	var numSteps = 0;
	var process;
	while (numSteps < MAX_STEPS && (process = workQueue.shift()))
	{
		if (process.root)
		{
			numSteps = step(numSteps, process);
		}
	}
	if (!process)
	{
		working = false;
		return;
	}
	setTimeout(work, 0);
}


return {
	succeed: succeed,
	fail: fail,
	nativeBinding: nativeBinding,
	andThen: F2(andThen),
	onError: F2(onError),
	receive: receive,

	spawn: spawn,
	kill: kill,
	sleep: sleep,
	send: F2(send),

	rawSpawn: rawSpawn,
	rawSend: rawSend
};

}();
var _elm_lang$core$Platform_Cmd$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Cmd$none = _elm_lang$core$Platform_Cmd$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Cmd_ops = _elm_lang$core$Platform_Cmd_ops || {};
_elm_lang$core$Platform_Cmd_ops['!'] = F2(
	function (model, commands) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _elm_lang$core$Platform_Cmd$batch(commands)
		};
	});
var _elm_lang$core$Platform_Cmd$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Cmd$Cmd = {ctor: 'Cmd'};

var _elm_lang$core$Platform_Sub$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Sub$none = _elm_lang$core$Platform_Sub$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Sub$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Sub$Sub = {ctor: 'Sub'};

var _elm_lang$core$Platform$hack = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Platform$sendToSelf = _elm_lang$core$Native_Platform.sendToSelf;
var _elm_lang$core$Platform$sendToApp = _elm_lang$core$Native_Platform.sendToApp;
var _elm_lang$core$Platform$programWithFlags = _elm_lang$core$Native_Platform.programWithFlags;
var _elm_lang$core$Platform$program = _elm_lang$core$Native_Platform.program;
var _elm_lang$core$Platform$Program = {ctor: 'Program'};
var _elm_lang$core$Platform$Task = {ctor: 'Task'};
var _elm_lang$core$Platform$ProcessId = {ctor: 'ProcessId'};
var _elm_lang$core$Platform$Router = {ctor: 'Router'};

var _elm_lang$core$Result$toMaybe = function (result) {
	var _p0 = result;
	if (_p0.ctor === 'Ok') {
		return _elm_lang$core$Maybe$Just(_p0._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$Result$withDefault = F2(
	function (def, result) {
		var _p1 = result;
		if (_p1.ctor === 'Ok') {
			return _p1._0;
		} else {
			return def;
		}
	});
var _elm_lang$core$Result$Err = function (a) {
	return {ctor: 'Err', _0: a};
};
var _elm_lang$core$Result$andThen = F2(
	function (callback, result) {
		var _p2 = result;
		if (_p2.ctor === 'Ok') {
			return callback(_p2._0);
		} else {
			return _elm_lang$core$Result$Err(_p2._0);
		}
	});
var _elm_lang$core$Result$Ok = function (a) {
	return {ctor: 'Ok', _0: a};
};
var _elm_lang$core$Result$map = F2(
	function (func, ra) {
		var _p3 = ra;
		if (_p3.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(
				func(_p3._0));
		} else {
			return _elm_lang$core$Result$Err(_p3._0);
		}
	});
var _elm_lang$core$Result$map2 = F3(
	function (func, ra, rb) {
		var _p4 = {ctor: '_Tuple2', _0: ra, _1: rb};
		if (_p4._0.ctor === 'Ok') {
			if (_p4._1.ctor === 'Ok') {
				return _elm_lang$core$Result$Ok(
					A2(func, _p4._0._0, _p4._1._0));
			} else {
				return _elm_lang$core$Result$Err(_p4._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p4._0._0);
		}
	});
var _elm_lang$core$Result$map3 = F4(
	function (func, ra, rb, rc) {
		var _p5 = {ctor: '_Tuple3', _0: ra, _1: rb, _2: rc};
		if (_p5._0.ctor === 'Ok') {
			if (_p5._1.ctor === 'Ok') {
				if (_p5._2.ctor === 'Ok') {
					return _elm_lang$core$Result$Ok(
						A3(func, _p5._0._0, _p5._1._0, _p5._2._0));
				} else {
					return _elm_lang$core$Result$Err(_p5._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p5._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p5._0._0);
		}
	});
var _elm_lang$core$Result$map4 = F5(
	function (func, ra, rb, rc, rd) {
		var _p6 = {ctor: '_Tuple4', _0: ra, _1: rb, _2: rc, _3: rd};
		if (_p6._0.ctor === 'Ok') {
			if (_p6._1.ctor === 'Ok') {
				if (_p6._2.ctor === 'Ok') {
					if (_p6._3.ctor === 'Ok') {
						return _elm_lang$core$Result$Ok(
							A4(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0));
					} else {
						return _elm_lang$core$Result$Err(_p6._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p6._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p6._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p6._0._0);
		}
	});
var _elm_lang$core$Result$map5 = F6(
	function (func, ra, rb, rc, rd, re) {
		var _p7 = {ctor: '_Tuple5', _0: ra, _1: rb, _2: rc, _3: rd, _4: re};
		if (_p7._0.ctor === 'Ok') {
			if (_p7._1.ctor === 'Ok') {
				if (_p7._2.ctor === 'Ok') {
					if (_p7._3.ctor === 'Ok') {
						if (_p7._4.ctor === 'Ok') {
							return _elm_lang$core$Result$Ok(
								A5(func, _p7._0._0, _p7._1._0, _p7._2._0, _p7._3._0, _p7._4._0));
						} else {
							return _elm_lang$core$Result$Err(_p7._4._0);
						}
					} else {
						return _elm_lang$core$Result$Err(_p7._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p7._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p7._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p7._0._0);
		}
	});
var _elm_lang$core$Result$mapError = F2(
	function (f, result) {
		var _p8 = result;
		if (_p8.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(_p8._0);
		} else {
			return _elm_lang$core$Result$Err(
				f(_p8._0));
		}
	});
var _elm_lang$core$Result$fromMaybe = F2(
	function (err, maybe) {
		var _p9 = maybe;
		if (_p9.ctor === 'Just') {
			return _elm_lang$core$Result$Ok(_p9._0);
		} else {
			return _elm_lang$core$Result$Err(err);
		}
	});

var _elm_lang$core$Task$onError = _elm_lang$core$Native_Scheduler.onError;
var _elm_lang$core$Task$andThen = _elm_lang$core$Native_Scheduler.andThen;
var _elm_lang$core$Task$spawnCmd = F2(
	function (router, _p0) {
		var _p1 = _p0;
		return _elm_lang$core$Native_Scheduler.spawn(
			A2(
				_elm_lang$core$Task$andThen,
				_elm_lang$core$Platform$sendToApp(router),
				_p1._0));
	});
var _elm_lang$core$Task$fail = _elm_lang$core$Native_Scheduler.fail;
var _elm_lang$core$Task$mapError = F2(
	function (convert, task) {
		return A2(
			_elm_lang$core$Task$onError,
			function (_p2) {
				return _elm_lang$core$Task$fail(
					convert(_p2));
			},
			task);
	});
var _elm_lang$core$Task$succeed = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return _elm_lang$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var _elm_lang$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return _elm_lang$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map3 = F4(
	function (func, taskA, taskB, taskC) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return _elm_lang$core$Task$succeed(
									A3(func, a, b, c));
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map4 = F5(
	function (func, taskA, taskB, taskC, taskD) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return _elm_lang$core$Task$succeed(
											A4(func, a, b, c, d));
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map5 = F6(
	function (func, taskA, taskB, taskC, taskD, taskE) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return A2(
											_elm_lang$core$Task$andThen,
											function (e) {
												return _elm_lang$core$Task$succeed(
													A5(func, a, b, c, d, e));
											},
											taskE);
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$sequence = function (tasks) {
	var _p3 = tasks;
	if (_p3.ctor === '[]') {
		return _elm_lang$core$Task$succeed(
			{ctor: '[]'});
	} else {
		return A3(
			_elm_lang$core$Task$map2,
			F2(
				function (x, y) {
					return {ctor: '::', _0: x, _1: y};
				}),
			_p3._0,
			_elm_lang$core$Task$sequence(_p3._1));
	}
};
var _elm_lang$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			_elm_lang$core$Task$map,
			function (_p4) {
				return {ctor: '_Tuple0'};
			},
			_elm_lang$core$Task$sequence(
				A2(
					_elm_lang$core$List$map,
					_elm_lang$core$Task$spawnCmd(router),
					commands)));
	});
var _elm_lang$core$Task$init = _elm_lang$core$Task$succeed(
	{ctor: '_Tuple0'});
var _elm_lang$core$Task$onSelfMsg = F3(
	function (_p7, _p6, _p5) {
		return _elm_lang$core$Task$succeed(
			{ctor: '_Tuple0'});
	});
var _elm_lang$core$Task$command = _elm_lang$core$Native_Platform.leaf('Task');
var _elm_lang$core$Task$Perform = function (a) {
	return {ctor: 'Perform', _0: a};
};
var _elm_lang$core$Task$perform = F2(
	function (toMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(_elm_lang$core$Task$map, toMessage, task)));
	});
var _elm_lang$core$Task$attempt = F2(
	function (resultToMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(
					_elm_lang$core$Task$onError,
					function (_p8) {
						return _elm_lang$core$Task$succeed(
							resultToMessage(
								_elm_lang$core$Result$Err(_p8)));
					},
					A2(
						_elm_lang$core$Task$andThen,
						function (_p9) {
							return _elm_lang$core$Task$succeed(
								resultToMessage(
									_elm_lang$core$Result$Ok(_p9)));
						},
						task))));
	});
var _elm_lang$core$Task$cmdMap = F2(
	function (tagger, _p10) {
		var _p11 = _p10;
		return _elm_lang$core$Task$Perform(
			A2(_elm_lang$core$Task$map, tagger, _p11._0));
	});
_elm_lang$core$Native_Platform.effectManagers['Task'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Task$init, onEffects: _elm_lang$core$Task$onEffects, onSelfMsg: _elm_lang$core$Task$onSelfMsg, tag: 'cmd', cmdMap: _elm_lang$core$Task$cmdMap};

//import Native.Utils //

var _elm_lang$core$Native_Debug = function() {

function log(tag, value)
{
	var msg = tag + ': ' + _elm_lang$core$Native_Utils.toString(value);
	var process = process || {};
	if (process.stdout)
	{
		process.stdout.write(msg);
	}
	else
	{
		console.log(msg);
	}
	return value;
}

function crash(message)
{
	throw new Error(message);
}

return {
	crash: crash,
	log: F2(log)
};

}();
//import Maybe, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_String = function() {

function isEmpty(str)
{
	return str.length === 0;
}
function cons(chr, str)
{
	return chr + str;
}
function uncons(str)
{
	var hd = str[0];
	if (hd)
	{
		return _elm_lang$core$Maybe$Just(_elm_lang$core$Native_Utils.Tuple2(_elm_lang$core$Native_Utils.chr(hd), str.slice(1)));
	}
	return _elm_lang$core$Maybe$Nothing;
}
function append(a, b)
{
	return a + b;
}
function concat(strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join('');
}
function length(str)
{
	return str.length;
}
function map(f, str)
{
	var out = str.split('');
	for (var i = out.length; i--; )
	{
		out[i] = f(_elm_lang$core$Native_Utils.chr(out[i]));
	}
	return out.join('');
}
function filter(pred, str)
{
	return str.split('').map(_elm_lang$core$Native_Utils.chr).filter(pred).join('');
}
function reverse(str)
{
	return str.split('').reverse().join('');
}
function foldl(f, b, str)
{
	var len = str.length;
	for (var i = 0; i < len; ++i)
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function foldr(f, b, str)
{
	for (var i = str.length; i--; )
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function split(sep, str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(sep));
}
function join(sep, strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join(sep);
}
function repeat(n, str)
{
	var result = '';
	while (n > 0)
	{
		if (n & 1)
		{
			result += str;
		}
		n >>= 1, str += str;
	}
	return result;
}
function slice(start, end, str)
{
	return str.slice(start, end);
}
function left(n, str)
{
	return n < 1 ? '' : str.slice(0, n);
}
function right(n, str)
{
	return n < 1 ? '' : str.slice(-n);
}
function dropLeft(n, str)
{
	return n < 1 ? str : str.slice(n);
}
function dropRight(n, str)
{
	return n < 1 ? str : str.slice(0, -n);
}
function pad(n, chr, str)
{
	var half = (n - str.length) / 2;
	return repeat(Math.ceil(half), chr) + str + repeat(half | 0, chr);
}
function padRight(n, chr, str)
{
	return str + repeat(n - str.length, chr);
}
function padLeft(n, chr, str)
{
	return repeat(n - str.length, chr) + str;
}

function trim(str)
{
	return str.trim();
}
function trimLeft(str)
{
	return str.replace(/^\s+/, '');
}
function trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function words(str)
{
	return _elm_lang$core$Native_List.fromArray(str.trim().split(/\s+/g));
}
function lines(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(/\r\n|\r|\n/g));
}

function toUpper(str)
{
	return str.toUpperCase();
}
function toLower(str)
{
	return str.toLowerCase();
}

function any(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return true;
		}
	}
	return false;
}
function all(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (!pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return false;
		}
	}
	return true;
}

function contains(sub, str)
{
	return str.indexOf(sub) > -1;
}
function startsWith(sub, str)
{
	return str.indexOf(sub) === 0;
}
function endsWith(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
}
function indexes(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _elm_lang$core$Native_List.Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _elm_lang$core$Native_List.fromArray(is);
}


function toInt(s)
{
	var len = s.length;

	// if empty
	if (len === 0)
	{
		return intErr(s);
	}

	// if hex
	var c = s[0];
	if (c === '0' && s[1] === 'x')
	{
		for (var i = 2; i < len; ++i)
		{
			var c = s[i];
			if (('0' <= c && c <= '9') || ('A' <= c && c <= 'F') || ('a' <= c && c <= 'f'))
			{
				continue;
			}
			return intErr(s);
		}
		return _elm_lang$core$Result$Ok(parseInt(s, 16));
	}

	// is decimal
	if (c > '9' || (c < '0' && c !== '-' && c !== '+'))
	{
		return intErr(s);
	}
	for (var i = 1; i < len; ++i)
	{
		var c = s[i];
		if (c < '0' || '9' < c)
		{
			return intErr(s);
		}
	}

	return _elm_lang$core$Result$Ok(parseInt(s, 10));
}

function intErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int");
}


function toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return floatErr(s);
	}
	var n = +s;
	// faster isNaN check
	return n === n ? _elm_lang$core$Result$Ok(n) : floatErr(s);
}

function floatErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float");
}


function toList(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split('').map(_elm_lang$core$Native_Utils.chr));
}
function fromList(chars)
{
	return _elm_lang$core$Native_List.toArray(chars).join('');
}

return {
	isEmpty: isEmpty,
	cons: F2(cons),
	uncons: uncons,
	append: F2(append),
	concat: concat,
	length: length,
	map: F2(map),
	filter: F2(filter),
	reverse: reverse,
	foldl: F3(foldl),
	foldr: F3(foldr),

	split: F2(split),
	join: F2(join),
	repeat: F2(repeat),

	slice: F3(slice),
	left: F2(left),
	right: F2(right),
	dropLeft: F2(dropLeft),
	dropRight: F2(dropRight),

	pad: F3(pad),
	padLeft: F3(padLeft),
	padRight: F3(padRight),

	trim: trim,
	trimLeft: trimLeft,
	trimRight: trimRight,

	words: words,
	lines: lines,

	toUpper: toUpper,
	toLower: toLower,

	any: F2(any),
	all: F2(all),

	contains: F2(contains),
	startsWith: F2(startsWith),
	endsWith: F2(endsWith),
	indexes: F2(indexes),

	toInt: toInt,
	toFloat: toFloat,
	toList: toList,
	fromList: fromList
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Char = function() {

return {
	fromCode: function(c) { return _elm_lang$core$Native_Utils.chr(String.fromCharCode(c)); },
	toCode: function(c) { return c.charCodeAt(0); },
	toUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toUpperCase()); },
	toLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLowerCase()); },
	toLocaleUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleUpperCase()); },
	toLocaleLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleLowerCase()); }
};

}();
var _elm_lang$core$Char$fromCode = _elm_lang$core$Native_Char.fromCode;
var _elm_lang$core$Char$toCode = _elm_lang$core$Native_Char.toCode;
var _elm_lang$core$Char$toLocaleLower = _elm_lang$core$Native_Char.toLocaleLower;
var _elm_lang$core$Char$toLocaleUpper = _elm_lang$core$Native_Char.toLocaleUpper;
var _elm_lang$core$Char$toLower = _elm_lang$core$Native_Char.toLower;
var _elm_lang$core$Char$toUpper = _elm_lang$core$Native_Char.toUpper;
var _elm_lang$core$Char$isBetween = F3(
	function (low, high, $char) {
		var code = _elm_lang$core$Char$toCode($char);
		return (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(low)) > -1) && (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(high)) < 1);
	});
var _elm_lang$core$Char$isUpper = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('A'),
	_elm_lang$core$Native_Utils.chr('Z'));
var _elm_lang$core$Char$isLower = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('a'),
	_elm_lang$core$Native_Utils.chr('z'));
var _elm_lang$core$Char$isDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('9'));
var _elm_lang$core$Char$isOctDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('7'));
var _elm_lang$core$Char$isHexDigit = function ($char) {
	return _elm_lang$core$Char$isDigit($char) || (A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('a'),
		_elm_lang$core$Native_Utils.chr('f'),
		$char) || A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('A'),
		_elm_lang$core$Native_Utils.chr('F'),
		$char));
};

var _elm_lang$core$String$fromList = _elm_lang$core$Native_String.fromList;
var _elm_lang$core$String$toList = _elm_lang$core$Native_String.toList;
var _elm_lang$core$String$toFloat = _elm_lang$core$Native_String.toFloat;
var _elm_lang$core$String$toInt = _elm_lang$core$Native_String.toInt;
var _elm_lang$core$String$indices = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$indexes = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$endsWith = _elm_lang$core$Native_String.endsWith;
var _elm_lang$core$String$startsWith = _elm_lang$core$Native_String.startsWith;
var _elm_lang$core$String$contains = _elm_lang$core$Native_String.contains;
var _elm_lang$core$String$all = _elm_lang$core$Native_String.all;
var _elm_lang$core$String$any = _elm_lang$core$Native_String.any;
var _elm_lang$core$String$toLower = _elm_lang$core$Native_String.toLower;
var _elm_lang$core$String$toUpper = _elm_lang$core$Native_String.toUpper;
var _elm_lang$core$String$lines = _elm_lang$core$Native_String.lines;
var _elm_lang$core$String$words = _elm_lang$core$Native_String.words;
var _elm_lang$core$String$trimRight = _elm_lang$core$Native_String.trimRight;
var _elm_lang$core$String$trimLeft = _elm_lang$core$Native_String.trimLeft;
var _elm_lang$core$String$trim = _elm_lang$core$Native_String.trim;
var _elm_lang$core$String$padRight = _elm_lang$core$Native_String.padRight;
var _elm_lang$core$String$padLeft = _elm_lang$core$Native_String.padLeft;
var _elm_lang$core$String$pad = _elm_lang$core$Native_String.pad;
var _elm_lang$core$String$dropRight = _elm_lang$core$Native_String.dropRight;
var _elm_lang$core$String$dropLeft = _elm_lang$core$Native_String.dropLeft;
var _elm_lang$core$String$right = _elm_lang$core$Native_String.right;
var _elm_lang$core$String$left = _elm_lang$core$Native_String.left;
var _elm_lang$core$String$slice = _elm_lang$core$Native_String.slice;
var _elm_lang$core$String$repeat = _elm_lang$core$Native_String.repeat;
var _elm_lang$core$String$join = _elm_lang$core$Native_String.join;
var _elm_lang$core$String$split = _elm_lang$core$Native_String.split;
var _elm_lang$core$String$foldr = _elm_lang$core$Native_String.foldr;
var _elm_lang$core$String$foldl = _elm_lang$core$Native_String.foldl;
var _elm_lang$core$String$reverse = _elm_lang$core$Native_String.reverse;
var _elm_lang$core$String$filter = _elm_lang$core$Native_String.filter;
var _elm_lang$core$String$map = _elm_lang$core$Native_String.map;
var _elm_lang$core$String$length = _elm_lang$core$Native_String.length;
var _elm_lang$core$String$concat = _elm_lang$core$Native_String.concat;
var _elm_lang$core$String$append = _elm_lang$core$Native_String.append;
var _elm_lang$core$String$uncons = _elm_lang$core$Native_String.uncons;
var _elm_lang$core$String$cons = _elm_lang$core$Native_String.cons;
var _elm_lang$core$String$fromChar = function ($char) {
	return A2(_elm_lang$core$String$cons, $char, '');
};
var _elm_lang$core$String$isEmpty = _elm_lang$core$Native_String.isEmpty;

var _elm_lang$core$Dict$foldr = F3(
	function (f, acc, t) {
		foldr:
		while (true) {
			var _p0 = t;
			if (_p0.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v1 = f,
					_v2 = A3(
					f,
					_p0._1,
					_p0._2,
					A3(_elm_lang$core$Dict$foldr, f, acc, _p0._4)),
					_v3 = _p0._3;
				f = _v1;
				acc = _v2;
				t = _v3;
				continue foldr;
			}
		}
	});
var _elm_lang$core$Dict$keys = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return {ctor: '::', _0: key, _1: keyList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$values = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, valueList) {
				return {ctor: '::', _0: value, _1: valueList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$toList = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: key, _1: value},
					_1: list
				};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$foldl = F3(
	function (f, acc, dict) {
		foldl:
		while (true) {
			var _p1 = dict;
			if (_p1.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v5 = f,
					_v6 = A3(
					f,
					_p1._1,
					_p1._2,
					A3(_elm_lang$core$Dict$foldl, f, acc, _p1._3)),
					_v7 = _p1._4;
				f = _v5;
				acc = _v6;
				dict = _v7;
				continue foldl;
			}
		}
	});
var _elm_lang$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _p2) {
				stepState:
				while (true) {
					var _p3 = _p2;
					var _p9 = _p3._1;
					var _p8 = _p3._0;
					var _p4 = _p8;
					if (_p4.ctor === '[]') {
						return {
							ctor: '_Tuple2',
							_0: _p8,
							_1: A3(rightStep, rKey, rValue, _p9)
						};
					} else {
						var _p7 = _p4._1;
						var _p6 = _p4._0._1;
						var _p5 = _p4._0._0;
						if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) < 0) {
							var _v10 = rKey,
								_v11 = rValue,
								_v12 = {
								ctor: '_Tuple2',
								_0: _p7,
								_1: A3(leftStep, _p5, _p6, _p9)
							};
							rKey = _v10;
							rValue = _v11;
							_p2 = _v12;
							continue stepState;
						} else {
							if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) > 0) {
								return {
									ctor: '_Tuple2',
									_0: _p8,
									_1: A3(rightStep, rKey, rValue, _p9)
								};
							} else {
								return {
									ctor: '_Tuple2',
									_0: _p7,
									_1: A4(bothStep, _p5, _p6, rValue, _p9)
								};
							}
						}
					}
				}
			});
		var _p10 = A3(
			_elm_lang$core$Dict$foldl,
			stepState,
			{
				ctor: '_Tuple2',
				_0: _elm_lang$core$Dict$toList(leftDict),
				_1: initialResult
			},
			rightDict);
		var leftovers = _p10._0;
		var intermediateResult = _p10._1;
		return A3(
			_elm_lang$core$List$foldl,
			F2(
				function (_p11, result) {
					var _p12 = _p11;
					return A3(leftStep, _p12._0, _p12._1, result);
				}),
			intermediateResult,
			leftovers);
	});
var _elm_lang$core$Dict$reportRemBug = F4(
	function (msg, c, lgot, rgot) {
		return _elm_lang$core$Native_Debug.crash(
			_elm_lang$core$String$concat(
				{
					ctor: '::',
					_0: 'Internal red-black tree invariant violated, expected ',
					_1: {
						ctor: '::',
						_0: msg,
						_1: {
							ctor: '::',
							_0: ' and got ',
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Basics$toString(c),
								_1: {
									ctor: '::',
									_0: '/',
									_1: {
										ctor: '::',
										_0: lgot,
										_1: {
											ctor: '::',
											_0: '/',
											_1: {
												ctor: '::',
												_0: rgot,
												_1: {
													ctor: '::',
													_0: '\nPlease report this bug to <https://github.com/elm-lang/core/issues>',
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					}
				}));
	});
var _elm_lang$core$Dict$isBBlack = function (dict) {
	var _p13 = dict;
	_v14_2:
	do {
		if (_p13.ctor === 'RBNode_elm_builtin') {
			if (_p13._0.ctor === 'BBlack') {
				return true;
			} else {
				break _v14_2;
			}
		} else {
			if (_p13._0.ctor === 'LBBlack') {
				return true;
			} else {
				break _v14_2;
			}
		}
	} while(false);
	return false;
};
var _elm_lang$core$Dict$sizeHelp = F2(
	function (n, dict) {
		sizeHelp:
		while (true) {
			var _p14 = dict;
			if (_p14.ctor === 'RBEmpty_elm_builtin') {
				return n;
			} else {
				var _v16 = A2(_elm_lang$core$Dict$sizeHelp, n + 1, _p14._4),
					_v17 = _p14._3;
				n = _v16;
				dict = _v17;
				continue sizeHelp;
			}
		}
	});
var _elm_lang$core$Dict$size = function (dict) {
	return A2(_elm_lang$core$Dict$sizeHelp, 0, dict);
};
var _elm_lang$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			var _p15 = dict;
			if (_p15.ctor === 'RBEmpty_elm_builtin') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p16 = A2(_elm_lang$core$Basics$compare, targetKey, _p15._1);
				switch (_p16.ctor) {
					case 'LT':
						var _v20 = targetKey,
							_v21 = _p15._3;
						targetKey = _v20;
						dict = _v21;
						continue get;
					case 'EQ':
						return _elm_lang$core$Maybe$Just(_p15._2);
					default:
						var _v22 = targetKey,
							_v23 = _p15._4;
						targetKey = _v22;
						dict = _v23;
						continue get;
				}
			}
		}
	});
var _elm_lang$core$Dict$member = F2(
	function (key, dict) {
		var _p17 = A2(_elm_lang$core$Dict$get, key, dict);
		if (_p17.ctor === 'Just') {
			return true;
		} else {
			return false;
		}
	});
var _elm_lang$core$Dict$maxWithDefault = F3(
	function (k, v, r) {
		maxWithDefault:
		while (true) {
			var _p18 = r;
			if (_p18.ctor === 'RBEmpty_elm_builtin') {
				return {ctor: '_Tuple2', _0: k, _1: v};
			} else {
				var _v26 = _p18._1,
					_v27 = _p18._2,
					_v28 = _p18._4;
				k = _v26;
				v = _v27;
				r = _v28;
				continue maxWithDefault;
			}
		}
	});
var _elm_lang$core$Dict$NBlack = {ctor: 'NBlack'};
var _elm_lang$core$Dict$BBlack = {ctor: 'BBlack'};
var _elm_lang$core$Dict$Black = {ctor: 'Black'};
var _elm_lang$core$Dict$blackish = function (t) {
	var _p19 = t;
	if (_p19.ctor === 'RBNode_elm_builtin') {
		var _p20 = _p19._0;
		return _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$Black) || _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$BBlack);
	} else {
		return true;
	}
};
var _elm_lang$core$Dict$Red = {ctor: 'Red'};
var _elm_lang$core$Dict$moreBlack = function (color) {
	var _p21 = color;
	switch (_p21.ctor) {
		case 'Black':
			return _elm_lang$core$Dict$BBlack;
		case 'Red':
			return _elm_lang$core$Dict$Black;
		case 'NBlack':
			return _elm_lang$core$Dict$Red;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a double black node more black!');
	}
};
var _elm_lang$core$Dict$lessBlack = function (color) {
	var _p22 = color;
	switch (_p22.ctor) {
		case 'BBlack':
			return _elm_lang$core$Dict$Black;
		case 'Black':
			return _elm_lang$core$Dict$Red;
		case 'Red':
			return _elm_lang$core$Dict$NBlack;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a negative black node less black!');
	}
};
var _elm_lang$core$Dict$LBBlack = {ctor: 'LBBlack'};
var _elm_lang$core$Dict$LBlack = {ctor: 'LBlack'};
var _elm_lang$core$Dict$RBEmpty_elm_builtin = function (a) {
	return {ctor: 'RBEmpty_elm_builtin', _0: a};
};
var _elm_lang$core$Dict$empty = _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
var _elm_lang$core$Dict$isEmpty = function (dict) {
	return _elm_lang$core$Native_Utils.eq(dict, _elm_lang$core$Dict$empty);
};
var _elm_lang$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {ctor: 'RBNode_elm_builtin', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _elm_lang$core$Dict$ensureBlackRoot = function (dict) {
	var _p23 = dict;
	if ((_p23.ctor === 'RBNode_elm_builtin') && (_p23._0.ctor === 'Red')) {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p23._1, _p23._2, _p23._3, _p23._4);
	} else {
		return dict;
	}
};
var _elm_lang$core$Dict$lessBlackTree = function (dict) {
	var _p24 = dict;
	if (_p24.ctor === 'RBNode_elm_builtin') {
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$lessBlack(_p24._0),
			_p24._1,
			_p24._2,
			_p24._3,
			_p24._4);
	} else {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	}
};
var _elm_lang$core$Dict$balancedTree = function (col) {
	return function (xk) {
		return function (xv) {
			return function (yk) {
				return function (yv) {
					return function (zk) {
						return function (zv) {
							return function (a) {
								return function (b) {
									return function (c) {
										return function (d) {
											return A5(
												_elm_lang$core$Dict$RBNode_elm_builtin,
												_elm_lang$core$Dict$lessBlack(col),
												yk,
												yv,
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, xk, xv, a, b),
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, zk, zv, c, d));
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _elm_lang$core$Dict$blacken = function (t) {
	var _p25 = t;
	if (_p25.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p25._1, _p25._2, _p25._3, _p25._4);
	}
};
var _elm_lang$core$Dict$redden = function (t) {
	var _p26 = t;
	if (_p26.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Native_Debug.crash('can\'t make a Leaf red');
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, _p26._1, _p26._2, _p26._3, _p26._4);
	}
};
var _elm_lang$core$Dict$balanceHelp = function (tree) {
	var _p27 = tree;
	_v36_6:
	do {
		_v36_5:
		do {
			_v36_4:
			do {
				_v36_3:
				do {
					_v36_2:
					do {
						_v36_1:
						do {
							_v36_0:
							do {
								if (_p27.ctor === 'RBNode_elm_builtin') {
									if (_p27._3.ctor === 'RBNode_elm_builtin') {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._3._0.ctor) {
												case 'Red':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																		break _v36_2;
																	} else {
																		if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																			break _v36_3;
																		} else {
																			break _v36_6;
																		}
																	}
																}
															}
														case 'NBlack':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																		break _v36_4;
																	} else {
																		break _v36_6;
																	}
																}
															}
														default:
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	break _v36_6;
																}
															}
													}
												case 'NBlack':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															}
														case 'NBlack':
															if (_p27._0.ctor === 'BBlack') {
																if ((((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																	break _v36_4;
																} else {
																	if ((((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															} else {
																break _v36_6;
															}
														default:
															if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																break _v36_5;
															} else {
																break _v36_6;
															}
													}
												default:
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	break _v36_6;
																}
															}
														case 'NBlack':
															if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																break _v36_4;
															} else {
																break _v36_6;
															}
														default:
															break _v36_6;
													}
											}
										} else {
											switch (_p27._3._0.ctor) {
												case 'Red':
													if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
														break _v36_0;
													} else {
														if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
															break _v36_1;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
														break _v36_5;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										}
									} else {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._4._0.ctor) {
												case 'Red':
													if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
														break _v36_2;
													} else {
														if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
															break _v36_3;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
														break _v36_4;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										} else {
											break _v36_6;
										}
									}
								} else {
									break _v36_6;
								}
							} while(false);
							return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._3._1)(_p27._3._3._2)(_p27._3._1)(_p27._3._2)(_p27._1)(_p27._2)(_p27._3._3._3)(_p27._3._3._4)(_p27._3._4)(_p27._4);
						} while(false);
						return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._1)(_p27._3._2)(_p27._3._4._1)(_p27._3._4._2)(_p27._1)(_p27._2)(_p27._3._3)(_p27._3._4._3)(_p27._3._4._4)(_p27._4);
					} while(false);
					return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._3._1)(_p27._4._3._2)(_p27._4._1)(_p27._4._2)(_p27._3)(_p27._4._3._3)(_p27._4._3._4)(_p27._4._4);
				} while(false);
				return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._1)(_p27._4._2)(_p27._4._4._1)(_p27._4._4._2)(_p27._3)(_p27._4._3)(_p27._4._4._3)(_p27._4._4._4);
			} while(false);
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_elm_lang$core$Dict$Black,
				_p27._4._3._1,
				_p27._4._3._2,
				A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3, _p27._4._3._3),
				A5(
					_elm_lang$core$Dict$balance,
					_elm_lang$core$Dict$Black,
					_p27._4._1,
					_p27._4._2,
					_p27._4._3._4,
					_elm_lang$core$Dict$redden(_p27._4._4)));
		} while(false);
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$Black,
			_p27._3._4._1,
			_p27._3._4._2,
			A5(
				_elm_lang$core$Dict$balance,
				_elm_lang$core$Dict$Black,
				_p27._3._1,
				_p27._3._2,
				_elm_lang$core$Dict$redden(_p27._3._3),
				_p27._3._4._3),
			A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3._4._4, _p27._4));
	} while(false);
	return tree;
};
var _elm_lang$core$Dict$balance = F5(
	function (c, k, v, l, r) {
		var tree = A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
		return _elm_lang$core$Dict$blackish(tree) ? _elm_lang$core$Dict$balanceHelp(tree) : tree;
	});
var _elm_lang$core$Dict$bubble = F5(
	function (c, k, v, l, r) {
		return (_elm_lang$core$Dict$isBBlack(l) || _elm_lang$core$Dict$isBBlack(r)) ? A5(
			_elm_lang$core$Dict$balance,
			_elm_lang$core$Dict$moreBlack(c),
			k,
			v,
			_elm_lang$core$Dict$lessBlackTree(l),
			_elm_lang$core$Dict$lessBlackTree(r)) : A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
	});
var _elm_lang$core$Dict$removeMax = F5(
	function (c, k, v, l, r) {
		var _p28 = r;
		if (_p28.ctor === 'RBEmpty_elm_builtin') {
			return A3(_elm_lang$core$Dict$rem, c, l, r);
		} else {
			return A5(
				_elm_lang$core$Dict$bubble,
				c,
				k,
				v,
				l,
				A5(_elm_lang$core$Dict$removeMax, _p28._0, _p28._1, _p28._2, _p28._3, _p28._4));
		}
	});
var _elm_lang$core$Dict$rem = F3(
	function (color, left, right) {
		var _p29 = {ctor: '_Tuple2', _0: left, _1: right};
		if (_p29._0.ctor === 'RBEmpty_elm_builtin') {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p30 = color;
				switch (_p30.ctor) {
					case 'Red':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
					case 'Black':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBBlack);
					default:
						return _elm_lang$core$Native_Debug.crash('cannot have bblack or nblack nodes at this point');
				}
			} else {
				var _p33 = _p29._1._0;
				var _p32 = _p29._0._0;
				var _p31 = {ctor: '_Tuple3', _0: color, _1: _p32, _2: _p33};
				if ((((_p31.ctor === '_Tuple3') && (_p31._0.ctor === 'Black')) && (_p31._1.ctor === 'LBlack')) && (_p31._2.ctor === 'Red')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._1._1, _p29._1._2, _p29._1._3, _p29._1._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/LBlack/Red',
						color,
						_elm_lang$core$Basics$toString(_p32),
						_elm_lang$core$Basics$toString(_p33));
				}
			}
		} else {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p36 = _p29._1._0;
				var _p35 = _p29._0._0;
				var _p34 = {ctor: '_Tuple3', _0: color, _1: _p35, _2: _p36};
				if ((((_p34.ctor === '_Tuple3') && (_p34._0.ctor === 'Black')) && (_p34._1.ctor === 'Red')) && (_p34._2.ctor === 'LBlack')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._0._1, _p29._0._2, _p29._0._3, _p29._0._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/Red/LBlack',
						color,
						_elm_lang$core$Basics$toString(_p35),
						_elm_lang$core$Basics$toString(_p36));
				}
			} else {
				var _p40 = _p29._0._2;
				var _p39 = _p29._0._4;
				var _p38 = _p29._0._1;
				var newLeft = A5(_elm_lang$core$Dict$removeMax, _p29._0._0, _p38, _p40, _p29._0._3, _p39);
				var _p37 = A3(_elm_lang$core$Dict$maxWithDefault, _p38, _p40, _p39);
				var k = _p37._0;
				var v = _p37._1;
				return A5(_elm_lang$core$Dict$bubble, color, k, v, newLeft, right);
			}
		}
	});
var _elm_lang$core$Dict$map = F2(
	function (f, dict) {
		var _p41 = dict;
		if (_p41.ctor === 'RBEmpty_elm_builtin') {
			return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
		} else {
			var _p42 = _p41._1;
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_p41._0,
				_p42,
				A2(f, _p42, _p41._2),
				A2(_elm_lang$core$Dict$map, f, _p41._3),
				A2(_elm_lang$core$Dict$map, f, _p41._4));
		}
	});
var _elm_lang$core$Dict$Same = {ctor: 'Same'};
var _elm_lang$core$Dict$Remove = {ctor: 'Remove'};
var _elm_lang$core$Dict$Insert = {ctor: 'Insert'};
var _elm_lang$core$Dict$update = F3(
	function (k, alter, dict) {
		var up = function (dict) {
			var _p43 = dict;
			if (_p43.ctor === 'RBEmpty_elm_builtin') {
				var _p44 = alter(_elm_lang$core$Maybe$Nothing);
				if (_p44.ctor === 'Nothing') {
					return {ctor: '_Tuple2', _0: _elm_lang$core$Dict$Same, _1: _elm_lang$core$Dict$empty};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Dict$Insert,
						_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, k, _p44._0, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty)
					};
				}
			} else {
				var _p55 = _p43._2;
				var _p54 = _p43._4;
				var _p53 = _p43._3;
				var _p52 = _p43._1;
				var _p51 = _p43._0;
				var _p45 = A2(_elm_lang$core$Basics$compare, k, _p52);
				switch (_p45.ctor) {
					case 'EQ':
						var _p46 = alter(
							_elm_lang$core$Maybe$Just(_p55));
						if (_p46.ctor === 'Nothing') {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Remove,
								_1: A3(_elm_lang$core$Dict$rem, _p51, _p53, _p54)
							};
						} else {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Same,
								_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p46._0, _p53, _p54)
							};
						}
					case 'LT':
						var _p47 = up(_p53);
						var flag = _p47._0;
						var newLeft = _p47._1;
						var _p48 = flag;
						switch (_p48.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, newLeft, _p54)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, newLeft, _p54)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, newLeft, _p54)
								};
						}
					default:
						var _p49 = up(_p54);
						var flag = _p49._0;
						var newRight = _p49._1;
						var _p50 = flag;
						switch (_p50.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, _p53, newRight)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, _p53, newRight)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, _p53, newRight)
								};
						}
				}
			}
		};
		var _p56 = up(dict);
		var flag = _p56._0;
		var updatedDict = _p56._1;
		var _p57 = flag;
		switch (_p57.ctor) {
			case 'Same':
				return updatedDict;
			case 'Insert':
				return _elm_lang$core$Dict$ensureBlackRoot(updatedDict);
			default:
				return _elm_lang$core$Dict$blacken(updatedDict);
		}
	});
var _elm_lang$core$Dict$insert = F3(
	function (key, value, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(
				_elm_lang$core$Maybe$Just(value)),
			dict);
	});
var _elm_lang$core$Dict$singleton = F2(
	function (key, value) {
		return A3(_elm_lang$core$Dict$insert, key, value, _elm_lang$core$Dict$empty);
	});
var _elm_lang$core$Dict$union = F2(
	function (t1, t2) {
		return A3(_elm_lang$core$Dict$foldl, _elm_lang$core$Dict$insert, t2, t1);
	});
var _elm_lang$core$Dict$filter = F2(
	function (predicate, dictionary) {
		var add = F3(
			function (key, value, dict) {
				return A2(predicate, key, value) ? A3(_elm_lang$core$Dict$insert, key, value, dict) : dict;
			});
		return A3(_elm_lang$core$Dict$foldl, add, _elm_lang$core$Dict$empty, dictionary);
	});
var _elm_lang$core$Dict$intersect = F2(
	function (t1, t2) {
		return A2(
			_elm_lang$core$Dict$filter,
			F2(
				function (k, _p58) {
					return A2(_elm_lang$core$Dict$member, k, t2);
				}),
			t1);
	});
var _elm_lang$core$Dict$partition = F2(
	function (predicate, dict) {
		var add = F3(
			function (key, value, _p59) {
				var _p60 = _p59;
				var _p62 = _p60._1;
				var _p61 = _p60._0;
				return A2(predicate, key, value) ? {
					ctor: '_Tuple2',
					_0: A3(_elm_lang$core$Dict$insert, key, value, _p61),
					_1: _p62
				} : {
					ctor: '_Tuple2',
					_0: _p61,
					_1: A3(_elm_lang$core$Dict$insert, key, value, _p62)
				};
			});
		return A3(
			_elm_lang$core$Dict$foldl,
			add,
			{ctor: '_Tuple2', _0: _elm_lang$core$Dict$empty, _1: _elm_lang$core$Dict$empty},
			dict);
	});
var _elm_lang$core$Dict$fromList = function (assocs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p63, dict) {
				var _p64 = _p63;
				return A3(_elm_lang$core$Dict$insert, _p64._0, _p64._1, dict);
			}),
		_elm_lang$core$Dict$empty,
		assocs);
};
var _elm_lang$core$Dict$remove = F2(
	function (key, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing),
			dict);
	});
var _elm_lang$core$Dict$diff = F2(
	function (t1, t2) {
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, v, t) {
					return A2(_elm_lang$core$Dict$remove, k, t);
				}),
			t1,
			t2);
	});

//import Native.Scheduler //

var _elm_lang$core$Native_Time = function() {

var now = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
{
	callback(_elm_lang$core$Native_Scheduler.succeed(Date.now()));
});

function setInterval_(interval, task)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var id = setInterval(function() {
			_elm_lang$core$Native_Scheduler.rawSpawn(task);
		}, interval);

		return function() { clearInterval(id); };
	});
}

return {
	now: now,
	setInterval_: F2(setInterval_)
};

}();
var _elm_lang$core$Time$setInterval = _elm_lang$core$Native_Time.setInterval_;
var _elm_lang$core$Time$spawnHelp = F3(
	function (router, intervals, processes) {
		var _p0 = intervals;
		if (_p0.ctor === '[]') {
			return _elm_lang$core$Task$succeed(processes);
		} else {
			var _p1 = _p0._0;
			var spawnRest = function (id) {
				return A3(
					_elm_lang$core$Time$spawnHelp,
					router,
					_p0._1,
					A3(_elm_lang$core$Dict$insert, _p1, id, processes));
			};
			var spawnTimer = _elm_lang$core$Native_Scheduler.spawn(
				A2(
					_elm_lang$core$Time$setInterval,
					_p1,
					A2(_elm_lang$core$Platform$sendToSelf, router, _p1)));
			return A2(_elm_lang$core$Task$andThen, spawnRest, spawnTimer);
		}
	});
var _elm_lang$core$Time$addMySub = F2(
	function (_p2, state) {
		var _p3 = _p2;
		var _p6 = _p3._1;
		var _p5 = _p3._0;
		var _p4 = A2(_elm_lang$core$Dict$get, _p5, state);
		if (_p4.ctor === 'Nothing') {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{
					ctor: '::',
					_0: _p6,
					_1: {ctor: '[]'}
				},
				state);
		} else {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{ctor: '::', _0: _p6, _1: _p4._0},
				state);
		}
	});
var _elm_lang$core$Time$inMilliseconds = function (t) {
	return t;
};
var _elm_lang$core$Time$millisecond = 1;
var _elm_lang$core$Time$second = 1000 * _elm_lang$core$Time$millisecond;
var _elm_lang$core$Time$minute = 60 * _elm_lang$core$Time$second;
var _elm_lang$core$Time$hour = 60 * _elm_lang$core$Time$minute;
var _elm_lang$core$Time$inHours = function (t) {
	return t / _elm_lang$core$Time$hour;
};
var _elm_lang$core$Time$inMinutes = function (t) {
	return t / _elm_lang$core$Time$minute;
};
var _elm_lang$core$Time$inSeconds = function (t) {
	return t / _elm_lang$core$Time$second;
};
var _elm_lang$core$Time$now = _elm_lang$core$Native_Time.now;
var _elm_lang$core$Time$onSelfMsg = F3(
	function (router, interval, state) {
		var _p7 = A2(_elm_lang$core$Dict$get, interval, state.taggers);
		if (_p7.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var tellTaggers = function (time) {
				return _elm_lang$core$Task$sequence(
					A2(
						_elm_lang$core$List$map,
						function (tagger) {
							return A2(
								_elm_lang$core$Platform$sendToApp,
								router,
								tagger(time));
						},
						_p7._0));
			};
			return A2(
				_elm_lang$core$Task$andThen,
				function (_p8) {
					return _elm_lang$core$Task$succeed(state);
				},
				A2(_elm_lang$core$Task$andThen, tellTaggers, _elm_lang$core$Time$now));
		}
	});
var _elm_lang$core$Time$subscription = _elm_lang$core$Native_Platform.leaf('Time');
var _elm_lang$core$Time$State = F2(
	function (a, b) {
		return {taggers: a, processes: b};
	});
var _elm_lang$core$Time$init = _elm_lang$core$Task$succeed(
	A2(_elm_lang$core$Time$State, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty));
var _elm_lang$core$Time$onEffects = F3(
	function (router, subs, _p9) {
		var _p10 = _p9;
		var rightStep = F3(
			function (_p12, id, _p11) {
				var _p13 = _p11;
				return {
					ctor: '_Tuple3',
					_0: _p13._0,
					_1: _p13._1,
					_2: A2(
						_elm_lang$core$Task$andThen,
						function (_p14) {
							return _p13._2;
						},
						_elm_lang$core$Native_Scheduler.kill(id))
				};
			});
		var bothStep = F4(
			function (interval, taggers, id, _p15) {
				var _p16 = _p15;
				return {
					ctor: '_Tuple3',
					_0: _p16._0,
					_1: A3(_elm_lang$core$Dict$insert, interval, id, _p16._1),
					_2: _p16._2
				};
			});
		var leftStep = F3(
			function (interval, taggers, _p17) {
				var _p18 = _p17;
				return {
					ctor: '_Tuple3',
					_0: {ctor: '::', _0: interval, _1: _p18._0},
					_1: _p18._1,
					_2: _p18._2
				};
			});
		var newTaggers = A3(_elm_lang$core$List$foldl, _elm_lang$core$Time$addMySub, _elm_lang$core$Dict$empty, subs);
		var _p19 = A6(
			_elm_lang$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			newTaggers,
			_p10.processes,
			{
				ctor: '_Tuple3',
				_0: {ctor: '[]'},
				_1: _elm_lang$core$Dict$empty,
				_2: _elm_lang$core$Task$succeed(
					{ctor: '_Tuple0'})
			});
		var spawnList = _p19._0;
		var existingDict = _p19._1;
		var killTask = _p19._2;
		return A2(
			_elm_lang$core$Task$andThen,
			function (newProcesses) {
				return _elm_lang$core$Task$succeed(
					A2(_elm_lang$core$Time$State, newTaggers, newProcesses));
			},
			A2(
				_elm_lang$core$Task$andThen,
				function (_p20) {
					return A3(_elm_lang$core$Time$spawnHelp, router, spawnList, existingDict);
				},
				killTask));
	});
var _elm_lang$core$Time$Every = F2(
	function (a, b) {
		return {ctor: 'Every', _0: a, _1: b};
	});
var _elm_lang$core$Time$every = F2(
	function (interval, tagger) {
		return _elm_lang$core$Time$subscription(
			A2(_elm_lang$core$Time$Every, interval, tagger));
	});
var _elm_lang$core$Time$subMap = F2(
	function (f, _p21) {
		var _p22 = _p21;
		return A2(
			_elm_lang$core$Time$Every,
			_p22._0,
			function (_p23) {
				return f(
					_p22._1(_p23));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Time'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Time$init, onEffects: _elm_lang$core$Time$onEffects, onSelfMsg: _elm_lang$core$Time$onSelfMsg, tag: 'sub', subMap: _elm_lang$core$Time$subMap};

var _elm_lang$core$Tuple$mapSecond = F2(
	function (func, _p0) {
		var _p1 = _p0;
		return {
			ctor: '_Tuple2',
			_0: _p1._0,
			_1: func(_p1._1)
		};
	});
var _elm_lang$core$Tuple$mapFirst = F2(
	function (func, _p2) {
		var _p3 = _p2;
		return {
			ctor: '_Tuple2',
			_0: func(_p3._0),
			_1: _p3._1
		};
	});
var _elm_lang$core$Tuple$second = function (_p4) {
	var _p5 = _p4;
	return _p5._1;
};
var _elm_lang$core$Tuple$first = function (_p6) {
	var _p7 = _p6;
	return _p7._0;
};

var _elm_lang$core$Random$onSelfMsg = F3(
	function (_p1, _p0, seed) {
		return _elm_lang$core$Task$succeed(seed);
	});
var _elm_lang$core$Random$magicNum8 = 2147483562;
var _elm_lang$core$Random$range = function (_p2) {
	return {ctor: '_Tuple2', _0: 0, _1: _elm_lang$core$Random$magicNum8};
};
var _elm_lang$core$Random$magicNum7 = 2147483399;
var _elm_lang$core$Random$magicNum6 = 2147483563;
var _elm_lang$core$Random$magicNum5 = 3791;
var _elm_lang$core$Random$magicNum4 = 40692;
var _elm_lang$core$Random$magicNum3 = 52774;
var _elm_lang$core$Random$magicNum2 = 12211;
var _elm_lang$core$Random$magicNum1 = 53668;
var _elm_lang$core$Random$magicNum0 = 40014;
var _elm_lang$core$Random$step = F2(
	function (_p3, seed) {
		var _p4 = _p3;
		return _p4._0(seed);
	});
var _elm_lang$core$Random$onEffects = F3(
	function (router, commands, seed) {
		var _p5 = commands;
		if (_p5.ctor === '[]') {
			return _elm_lang$core$Task$succeed(seed);
		} else {
			var _p6 = A2(_elm_lang$core$Random$step, _p5._0._0, seed);
			var value = _p6._0;
			var newSeed = _p6._1;
			return A2(
				_elm_lang$core$Task$andThen,
				function (_p7) {
					return A3(_elm_lang$core$Random$onEffects, router, _p5._1, newSeed);
				},
				A2(_elm_lang$core$Platform$sendToApp, router, value));
		}
	});
var _elm_lang$core$Random$listHelp = F4(
	function (list, n, generate, seed) {
		listHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 1) < 0) {
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$List$reverse(list),
					_1: seed
				};
			} else {
				var _p8 = generate(seed);
				var value = _p8._0;
				var newSeed = _p8._1;
				var _v2 = {ctor: '::', _0: value, _1: list},
					_v3 = n - 1,
					_v4 = generate,
					_v5 = newSeed;
				list = _v2;
				n = _v3;
				generate = _v4;
				seed = _v5;
				continue listHelp;
			}
		}
	});
var _elm_lang$core$Random$minInt = -2147483648;
var _elm_lang$core$Random$maxInt = 2147483647;
var _elm_lang$core$Random$iLogBase = F2(
	function (b, i) {
		return (_elm_lang$core$Native_Utils.cmp(i, b) < 0) ? 1 : (1 + A2(_elm_lang$core$Random$iLogBase, b, (i / b) | 0));
	});
var _elm_lang$core$Random$command = _elm_lang$core$Native_Platform.leaf('Random');
var _elm_lang$core$Random$Generator = function (a) {
	return {ctor: 'Generator', _0: a};
};
var _elm_lang$core$Random$list = F2(
	function (n, _p9) {
		var _p10 = _p9;
		return _elm_lang$core$Random$Generator(
			function (seed) {
				return A4(
					_elm_lang$core$Random$listHelp,
					{ctor: '[]'},
					n,
					_p10._0,
					seed);
			});
	});
var _elm_lang$core$Random$map = F2(
	function (func, _p11) {
		var _p12 = _p11;
		return _elm_lang$core$Random$Generator(
			function (seed0) {
				var _p13 = _p12._0(seed0);
				var a = _p13._0;
				var seed1 = _p13._1;
				return {
					ctor: '_Tuple2',
					_0: func(a),
					_1: seed1
				};
			});
	});
var _elm_lang$core$Random$map2 = F3(
	function (func, _p15, _p14) {
		var _p16 = _p15;
		var _p17 = _p14;
		return _elm_lang$core$Random$Generator(
			function (seed0) {
				var _p18 = _p16._0(seed0);
				var a = _p18._0;
				var seed1 = _p18._1;
				var _p19 = _p17._0(seed1);
				var b = _p19._0;
				var seed2 = _p19._1;
				return {
					ctor: '_Tuple2',
					_0: A2(func, a, b),
					_1: seed2
				};
			});
	});
var _elm_lang$core$Random$pair = F2(
	function (genA, genB) {
		return A3(
			_elm_lang$core$Random$map2,
			F2(
				function (v0, v1) {
					return {ctor: '_Tuple2', _0: v0, _1: v1};
				}),
			genA,
			genB);
	});
var _elm_lang$core$Random$map3 = F4(
	function (func, _p22, _p21, _p20) {
		var _p23 = _p22;
		var _p24 = _p21;
		var _p25 = _p20;
		return _elm_lang$core$Random$Generator(
			function (seed0) {
				var _p26 = _p23._0(seed0);
				var a = _p26._0;
				var seed1 = _p26._1;
				var _p27 = _p24._0(seed1);
				var b = _p27._0;
				var seed2 = _p27._1;
				var _p28 = _p25._0(seed2);
				var c = _p28._0;
				var seed3 = _p28._1;
				return {
					ctor: '_Tuple2',
					_0: A3(func, a, b, c),
					_1: seed3
				};
			});
	});
var _elm_lang$core$Random$map4 = F5(
	function (func, _p32, _p31, _p30, _p29) {
		var _p33 = _p32;
		var _p34 = _p31;
		var _p35 = _p30;
		var _p36 = _p29;
		return _elm_lang$core$Random$Generator(
			function (seed0) {
				var _p37 = _p33._0(seed0);
				var a = _p37._0;
				var seed1 = _p37._1;
				var _p38 = _p34._0(seed1);
				var b = _p38._0;
				var seed2 = _p38._1;
				var _p39 = _p35._0(seed2);
				var c = _p39._0;
				var seed3 = _p39._1;
				var _p40 = _p36._0(seed3);
				var d = _p40._0;
				var seed4 = _p40._1;
				return {
					ctor: '_Tuple2',
					_0: A4(func, a, b, c, d),
					_1: seed4
				};
			});
	});
var _elm_lang$core$Random$map5 = F6(
	function (func, _p45, _p44, _p43, _p42, _p41) {
		var _p46 = _p45;
		var _p47 = _p44;
		var _p48 = _p43;
		var _p49 = _p42;
		var _p50 = _p41;
		return _elm_lang$core$Random$Generator(
			function (seed0) {
				var _p51 = _p46._0(seed0);
				var a = _p51._0;
				var seed1 = _p51._1;
				var _p52 = _p47._0(seed1);
				var b = _p52._0;
				var seed2 = _p52._1;
				var _p53 = _p48._0(seed2);
				var c = _p53._0;
				var seed3 = _p53._1;
				var _p54 = _p49._0(seed3);
				var d = _p54._0;
				var seed4 = _p54._1;
				var _p55 = _p50._0(seed4);
				var e = _p55._0;
				var seed5 = _p55._1;
				return {
					ctor: '_Tuple2',
					_0: A5(func, a, b, c, d, e),
					_1: seed5
				};
			});
	});
var _elm_lang$core$Random$andThen = F2(
	function (callback, _p56) {
		var _p57 = _p56;
		return _elm_lang$core$Random$Generator(
			function (seed) {
				var _p58 = _p57._0(seed);
				var result = _p58._0;
				var newSeed = _p58._1;
				var _p59 = callback(result);
				var genB = _p59._0;
				return genB(newSeed);
			});
	});
var _elm_lang$core$Random$State = F2(
	function (a, b) {
		return {ctor: 'State', _0: a, _1: b};
	});
var _elm_lang$core$Random$initState = function (seed) {
	var s = A2(_elm_lang$core$Basics$max, seed, 0 - seed);
	var q = (s / (_elm_lang$core$Random$magicNum6 - 1)) | 0;
	var s2 = A2(_elm_lang$core$Basics_ops['%'], q, _elm_lang$core$Random$magicNum7 - 1);
	var s1 = A2(_elm_lang$core$Basics_ops['%'], s, _elm_lang$core$Random$magicNum6 - 1);
	return A2(_elm_lang$core$Random$State, s1 + 1, s2 + 1);
};
var _elm_lang$core$Random$next = function (_p60) {
	var _p61 = _p60;
	var _p63 = _p61._1;
	var _p62 = _p61._0;
	var k2 = (_p63 / _elm_lang$core$Random$magicNum3) | 0;
	var rawState2 = (_elm_lang$core$Random$magicNum4 * (_p63 - (k2 * _elm_lang$core$Random$magicNum3))) - (k2 * _elm_lang$core$Random$magicNum5);
	var newState2 = (_elm_lang$core$Native_Utils.cmp(rawState2, 0) < 0) ? (rawState2 + _elm_lang$core$Random$magicNum7) : rawState2;
	var k1 = (_p62 / _elm_lang$core$Random$magicNum1) | 0;
	var rawState1 = (_elm_lang$core$Random$magicNum0 * (_p62 - (k1 * _elm_lang$core$Random$magicNum1))) - (k1 * _elm_lang$core$Random$magicNum2);
	var newState1 = (_elm_lang$core$Native_Utils.cmp(rawState1, 0) < 0) ? (rawState1 + _elm_lang$core$Random$magicNum6) : rawState1;
	var z = newState1 - newState2;
	var newZ = (_elm_lang$core$Native_Utils.cmp(z, 1) < 0) ? (z + _elm_lang$core$Random$magicNum8) : z;
	return {
		ctor: '_Tuple2',
		_0: newZ,
		_1: A2(_elm_lang$core$Random$State, newState1, newState2)
	};
};
var _elm_lang$core$Random$split = function (_p64) {
	var _p65 = _p64;
	var _p68 = _p65._1;
	var _p67 = _p65._0;
	var _p66 = _elm_lang$core$Tuple$second(
		_elm_lang$core$Random$next(_p65));
	var t1 = _p66._0;
	var t2 = _p66._1;
	var new_s2 = _elm_lang$core$Native_Utils.eq(_p68, 1) ? (_elm_lang$core$Random$magicNum7 - 1) : (_p68 - 1);
	var new_s1 = _elm_lang$core$Native_Utils.eq(_p67, _elm_lang$core$Random$magicNum6 - 1) ? 1 : (_p67 + 1);
	return {
		ctor: '_Tuple2',
		_0: A2(_elm_lang$core$Random$State, new_s1, t2),
		_1: A2(_elm_lang$core$Random$State, t1, new_s2)
	};
};
var _elm_lang$core$Random$Seed = function (a) {
	return {ctor: 'Seed', _0: a};
};
var _elm_lang$core$Random$int = F2(
	function (a, b) {
		return _elm_lang$core$Random$Generator(
			function (_p69) {
				var _p70 = _p69;
				var _p75 = _p70._0;
				var base = 2147483561;
				var f = F3(
					function (n, acc, state) {
						f:
						while (true) {
							var _p71 = n;
							if (_p71 === 0) {
								return {ctor: '_Tuple2', _0: acc, _1: state};
							} else {
								var _p72 = _p75.next(state);
								var x = _p72._0;
								var nextState = _p72._1;
								var _v27 = n - 1,
									_v28 = x + (acc * base),
									_v29 = nextState;
								n = _v27;
								acc = _v28;
								state = _v29;
								continue f;
							}
						}
					});
				var _p73 = (_elm_lang$core$Native_Utils.cmp(a, b) < 0) ? {ctor: '_Tuple2', _0: a, _1: b} : {ctor: '_Tuple2', _0: b, _1: a};
				var lo = _p73._0;
				var hi = _p73._1;
				var k = (hi - lo) + 1;
				var n = A2(_elm_lang$core$Random$iLogBase, base, k);
				var _p74 = A3(f, n, 1, _p75.state);
				var v = _p74._0;
				var nextState = _p74._1;
				return {
					ctor: '_Tuple2',
					_0: lo + A2(_elm_lang$core$Basics_ops['%'], v, k),
					_1: _elm_lang$core$Random$Seed(
						_elm_lang$core$Native_Utils.update(
							_p75,
							{state: nextState}))
				};
			});
	});
var _elm_lang$core$Random$bool = A2(
	_elm_lang$core$Random$map,
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.eq(x, y);
		})(1),
	A2(_elm_lang$core$Random$int, 0, 1));
var _elm_lang$core$Random$float = F2(
	function (a, b) {
		return _elm_lang$core$Random$Generator(
			function (seed) {
				var _p76 = A2(
					_elm_lang$core$Random$step,
					A2(_elm_lang$core$Random$int, _elm_lang$core$Random$minInt, _elm_lang$core$Random$maxInt),
					seed);
				var number = _p76._0;
				var newSeed = _p76._1;
				var negativeOneToOne = _elm_lang$core$Basics$toFloat(number) / _elm_lang$core$Basics$toFloat(_elm_lang$core$Random$maxInt - _elm_lang$core$Random$minInt);
				var _p77 = (_elm_lang$core$Native_Utils.cmp(a, b) < 0) ? {ctor: '_Tuple2', _0: a, _1: b} : {ctor: '_Tuple2', _0: b, _1: a};
				var lo = _p77._0;
				var hi = _p77._1;
				var scaled = ((lo + hi) / 2) + ((hi - lo) * negativeOneToOne);
				return {ctor: '_Tuple2', _0: scaled, _1: newSeed};
			});
	});
var _elm_lang$core$Random$initialSeed = function (n) {
	return _elm_lang$core$Random$Seed(
		{
			state: _elm_lang$core$Random$initState(n),
			next: _elm_lang$core$Random$next,
			split: _elm_lang$core$Random$split,
			range: _elm_lang$core$Random$range
		});
};
var _elm_lang$core$Random$init = A2(
	_elm_lang$core$Task$andThen,
	function (t) {
		return _elm_lang$core$Task$succeed(
			_elm_lang$core$Random$initialSeed(
				_elm_lang$core$Basics$round(t)));
	},
	_elm_lang$core$Time$now);
var _elm_lang$core$Random$Generate = function (a) {
	return {ctor: 'Generate', _0: a};
};
var _elm_lang$core$Random$generate = F2(
	function (tagger, generator) {
		return _elm_lang$core$Random$command(
			_elm_lang$core$Random$Generate(
				A2(_elm_lang$core$Random$map, tagger, generator)));
	});
var _elm_lang$core$Random$cmdMap = F2(
	function (func, _p78) {
		var _p79 = _p78;
		return _elm_lang$core$Random$Generate(
			A2(_elm_lang$core$Random$map, func, _p79._0));
	});
_elm_lang$core$Native_Platform.effectManagers['Random'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Random$init, onEffects: _elm_lang$core$Random$onEffects, onSelfMsg: _elm_lang$core$Random$onSelfMsg, tag: 'cmd', cmdMap: _elm_lang$core$Random$cmdMap};

var _elm_lang$lazy$Native_Lazy = function() {

function memoize(thunk)
{
    var value;
    var isForced = false;
    return function(tuple0) {
        if (!isForced) {
            value = thunk(tuple0);
            isForced = true;
        }
        return value;
    };
}

return {
    memoize: memoize
};

}();

var _elm_lang$core$Debug$crash = _elm_lang$core$Native_Debug.crash;
var _elm_lang$core$Debug$log = _elm_lang$core$Native_Debug.log;

var _elm_lang$lazy$Lazy$force = function (_p0) {
	var _p1 = _p0;
	return _p1._0(
		{ctor: '_Tuple0'});
};
var _elm_lang$lazy$Lazy$Lazy = function (a) {
	return {ctor: 'Lazy', _0: a};
};
var _elm_lang$lazy$Lazy$lazy = function (thunk) {
	return _elm_lang$lazy$Lazy$Lazy(
		_elm_lang$lazy$Native_Lazy.memoize(thunk));
};
var _elm_lang$lazy$Lazy$map = F2(
	function (f, a) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p2) {
				var _p3 = _p2;
				return f(
					_elm_lang$lazy$Lazy$force(a));
			});
	});
var _elm_lang$lazy$Lazy$map2 = F3(
	function (f, a, b) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p4) {
				var _p5 = _p4;
				return A2(
					f,
					_elm_lang$lazy$Lazy$force(a),
					_elm_lang$lazy$Lazy$force(b));
			});
	});
var _elm_lang$lazy$Lazy$map3 = F4(
	function (f, a, b, c) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p6) {
				var _p7 = _p6;
				return A3(
					f,
					_elm_lang$lazy$Lazy$force(a),
					_elm_lang$lazy$Lazy$force(b),
					_elm_lang$lazy$Lazy$force(c));
			});
	});
var _elm_lang$lazy$Lazy$map4 = F5(
	function (f, a, b, c, d) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p8) {
				var _p9 = _p8;
				return A4(
					f,
					_elm_lang$lazy$Lazy$force(a),
					_elm_lang$lazy$Lazy$force(b),
					_elm_lang$lazy$Lazy$force(c),
					_elm_lang$lazy$Lazy$force(d));
			});
	});
var _elm_lang$lazy$Lazy$map5 = F6(
	function (f, a, b, c, d, e) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p10) {
				var _p11 = _p10;
				return A5(
					f,
					_elm_lang$lazy$Lazy$force(a),
					_elm_lang$lazy$Lazy$force(b),
					_elm_lang$lazy$Lazy$force(c),
					_elm_lang$lazy$Lazy$force(d),
					_elm_lang$lazy$Lazy$force(e));
			});
	});
var _elm_lang$lazy$Lazy$apply = F2(
	function (f, x) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p12) {
				var _p13 = _p12;
				return A2(
					_elm_lang$lazy$Lazy$force,
					f,
					_elm_lang$lazy$Lazy$force(x));
			});
	});
var _elm_lang$lazy$Lazy$andThen = F2(
	function (callback, a) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p14) {
				var _p15 = _p14;
				return _elm_lang$lazy$Lazy$force(
					callback(
						_elm_lang$lazy$Lazy$force(a)));
			});
	});

var _elm_community$lazy_list$Lazy_List$toArray = function (list) {
	var _p0 = _elm_lang$lazy$Lazy$force(list);
	if (_p0.ctor === 'Nil') {
		return _elm_lang$core$Array$empty;
	} else {
		return A2(
			_elm_lang$core$Array$append,
			A2(_elm_lang$core$Array$push, _p0._0, _elm_lang$core$Array$empty),
			_elm_community$lazy_list$Lazy_List$toArray(_p0._1));
	}
};
var _elm_community$lazy_list$Lazy_List$toList = function (list) {
	var _p1 = _elm_lang$lazy$Lazy$force(list);
	if (_p1.ctor === 'Nil') {
		return {ctor: '[]'};
	} else {
		return {
			ctor: '::',
			_0: _p1._0,
			_1: _elm_community$lazy_list$Lazy_List$toList(_p1._1)
		};
	}
};
var _elm_community$lazy_list$Lazy_List$foldr = F3(
	function (reducer, b, list) {
		return A3(
			_elm_lang$core$Array$foldr,
			reducer,
			b,
			_elm_community$lazy_list$Lazy_List$toArray(list));
	});
var _elm_community$lazy_list$Lazy_List$reduce = F3(
	function (reducer, b, list) {
		reduce:
		while (true) {
			var _p2 = _elm_lang$lazy$Lazy$force(list);
			if (_p2.ctor === 'Nil') {
				return b;
			} else {
				var _v3 = reducer,
					_v4 = A2(reducer, _p2._0, b),
					_v5 = _p2._1;
				reducer = _v3;
				b = _v4;
				list = _v5;
				continue reduce;
			}
		}
	});
var _elm_community$lazy_list$Lazy_List$foldl = _elm_community$lazy_list$Lazy_List$reduce;
var _elm_community$lazy_list$Lazy_List$sum = A2(
	_elm_community$lazy_list$Lazy_List$reduce,
	F2(
		function (x, y) {
			return x + y;
		}),
	0);
var _elm_community$lazy_list$Lazy_List$product = A2(
	_elm_community$lazy_list$Lazy_List$reduce,
	F2(
		function (x, y) {
			return x * y;
		}),
	1);
var _elm_community$lazy_list$Lazy_List$length = A2(
	_elm_community$lazy_list$Lazy_List$reduce,
	F2(
		function (_p3, n) {
			return n + 1;
		}),
	0);
var _elm_community$lazy_list$Lazy_List$member = F2(
	function (a, list) {
		var _p4 = _elm_lang$lazy$Lazy$force(list);
		if (_p4.ctor === 'Nil') {
			return false;
		} else {
			return _elm_lang$core$Native_Utils.eq(_p4._0, a) || A2(_elm_community$lazy_list$Lazy_List$member, a, _p4._1);
		}
	});
var _elm_community$lazy_list$Lazy_List$headAndTail = function (list) {
	var _p5 = _elm_lang$lazy$Lazy$force(list);
	if (_p5.ctor === 'Nil') {
		return _elm_lang$core$Maybe$Nothing;
	} else {
		return _elm_lang$core$Maybe$Just(
			{ctor: '_Tuple2', _0: _p5._0, _1: _p5._1});
	}
};
var _elm_community$lazy_list$Lazy_List$tail = function (list) {
	var _p6 = _elm_lang$lazy$Lazy$force(list);
	if (_p6.ctor === 'Nil') {
		return _elm_lang$core$Maybe$Nothing;
	} else {
		return _elm_lang$core$Maybe$Just(_p6._1);
	}
};
var _elm_community$lazy_list$Lazy_List$head = function (list) {
	var _p7 = _elm_lang$lazy$Lazy$force(list);
	if (_p7.ctor === 'Nil') {
		return _elm_lang$core$Maybe$Nothing;
	} else {
		return _elm_lang$core$Maybe$Just(_p7._0);
	}
};
var _elm_community$lazy_list$Lazy_List$isEmpty = function (list) {
	var _p8 = _elm_lang$lazy$Lazy$force(list);
	if (_p8.ctor === 'Nil') {
		return true;
	} else {
		return false;
	}
};
var _elm_community$lazy_list$Lazy_List$Cons = F2(
	function (a, b) {
		return {ctor: 'Cons', _0: a, _1: b};
	});
var _elm_community$lazy_list$Lazy_List$cons = F2(
	function (a, list) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p9) {
				var _p10 = _p9;
				return A2(_elm_community$lazy_list$Lazy_List$Cons, a, list);
			});
	});
var _elm_community$lazy_list$Lazy_List_ops = _elm_community$lazy_list$Lazy_List_ops || {};
_elm_community$lazy_list$Lazy_List_ops[':::'] = _elm_community$lazy_list$Lazy_List$cons;
var _elm_community$lazy_list$Lazy_List$append = F2(
	function (list1, list2) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p11) {
				var _p12 = _p11;
				var _p13 = _elm_lang$lazy$Lazy$force(list1);
				if (_p13.ctor === 'Nil') {
					return _elm_lang$lazy$Lazy$force(list2);
				} else {
					return _elm_lang$lazy$Lazy$force(
						A2(
							_elm_community$lazy_list$Lazy_List_ops[':::'],
							_p13._0,
							A2(_elm_community$lazy_list$Lazy_List_ops['+++'], _p13._1, list2)));
				}
			});
	});
var _elm_community$lazy_list$Lazy_List_ops = _elm_community$lazy_list$Lazy_List_ops || {};
_elm_community$lazy_list$Lazy_List_ops['+++'] = _elm_community$lazy_list$Lazy_List$append;
var _elm_community$lazy_list$Lazy_List$cycle = function (list) {
	return A2(
		_elm_community$lazy_list$Lazy_List_ops['+++'],
		list,
		_elm_lang$lazy$Lazy$lazy(
			function (_p14) {
				var _p15 = _p14;
				return _elm_lang$lazy$Lazy$force(
					_elm_community$lazy_list$Lazy_List$cycle(list));
			}));
};
var _elm_community$lazy_list$Lazy_List$interleave = F2(
	function (list1, list2) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p16) {
				var _p17 = _p16;
				var _p18 = _elm_lang$lazy$Lazy$force(list1);
				if (_p18.ctor === 'Nil') {
					return _elm_lang$lazy$Lazy$force(list2);
				} else {
					var _p19 = _elm_lang$lazy$Lazy$force(list2);
					if (_p19.ctor === 'Nil') {
						return _elm_lang$lazy$Lazy$force(list1);
					} else {
						return _elm_lang$lazy$Lazy$force(
							A2(
								_elm_community$lazy_list$Lazy_List_ops[':::'],
								_p18._0,
								A2(
									_elm_community$lazy_list$Lazy_List_ops[':::'],
									_p19._0,
									A2(_elm_community$lazy_list$Lazy_List$interleave, _p18._1, _p19._1))));
					}
				}
			});
	});
var _elm_community$lazy_list$Lazy_List$repeat = function (a) {
	return _elm_lang$lazy$Lazy$lazy(
		function (_p20) {
			var _p21 = _p20;
			return A2(
				_elm_community$lazy_list$Lazy_List$Cons,
				a,
				_elm_community$lazy_list$Lazy_List$repeat(a));
		});
};
var _elm_community$lazy_list$Lazy_List$iterate = F2(
	function (f, a) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p22) {
				var _p23 = _p22;
				return A2(
					_elm_community$lazy_list$Lazy_List$Cons,
					a,
					A2(
						_elm_community$lazy_list$Lazy_List$iterate,
						f,
						f(a)));
			});
	});
var _elm_community$lazy_list$Lazy_List$numbers = A2(
	_elm_community$lazy_list$Lazy_List$iterate,
	F2(
		function (x, y) {
			return x + y;
		})(1),
	1);
var _elm_community$lazy_list$Lazy_List$Nil = {ctor: 'Nil'};
var _elm_community$lazy_list$Lazy_List$empty = _elm_lang$lazy$Lazy$lazy(
	function (_p24) {
		var _p25 = _p24;
		return _elm_community$lazy_list$Lazy_List$Nil;
	});
var _elm_community$lazy_list$Lazy_List$singleton = function (a) {
	return A2(_elm_community$lazy_list$Lazy_List$cons, a, _elm_community$lazy_list$Lazy_List$empty);
};
var _elm_community$lazy_list$Lazy_List$reverse = A2(_elm_community$lazy_list$Lazy_List$reduce, _elm_community$lazy_list$Lazy_List$cons, _elm_community$lazy_list$Lazy_List$empty);
var _elm_community$lazy_list$Lazy_List$fromList = A2(_elm_lang$core$List$foldr, _elm_community$lazy_list$Lazy_List$cons, _elm_community$lazy_list$Lazy_List$empty);
var _elm_community$lazy_list$Lazy_List$fromArray = A2(_elm_lang$core$Array$foldr, _elm_community$lazy_list$Lazy_List$cons, _elm_community$lazy_list$Lazy_List$empty);
var _elm_community$lazy_list$Lazy_List$intersperse = F2(
	function (a, list) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p26) {
				var _p27 = _p26;
				var _p28 = _elm_lang$lazy$Lazy$force(list);
				if (_p28.ctor === 'Nil') {
					return _elm_community$lazy_list$Lazy_List$Nil;
				} else {
					var _p33 = _p28._0;
					var _p29 = _elm_lang$lazy$Lazy$force(_p28._1);
					if (_p29.ctor === 'Nil') {
						return _elm_lang$lazy$Lazy$force(
							A2(_elm_community$lazy_list$Lazy_List_ops[':::'], _p33, _elm_community$lazy_list$Lazy_List$empty));
					} else {
						var _p32 = _p29._1;
						var _p31 = _p29._0;
						var _p30 = _elm_lang$lazy$Lazy$force(_p32);
						if (_p30.ctor === 'Nil') {
							return _elm_lang$lazy$Lazy$force(
								A2(
									_elm_community$lazy_list$Lazy_List_ops[':::'],
									_p33,
									A2(
										_elm_community$lazy_list$Lazy_List_ops[':::'],
										a,
										A2(_elm_community$lazy_list$Lazy_List_ops[':::'], _p31, _elm_community$lazy_list$Lazy_List$empty))));
						} else {
							return _elm_lang$lazy$Lazy$force(
								A2(
									_elm_community$lazy_list$Lazy_List_ops[':::'],
									_p33,
									A2(
										_elm_community$lazy_list$Lazy_List_ops[':::'],
										a,
										A2(
											_elm_community$lazy_list$Lazy_List_ops[':::'],
											_p31,
											A2(
												_elm_community$lazy_list$Lazy_List_ops[':::'],
												a,
												A2(_elm_community$lazy_list$Lazy_List$intersperse, a, _p32))))));
						}
					}
				}
			});
	});
var _elm_community$lazy_list$Lazy_List$take = F2(
	function (n, list) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p34) {
				var _p35 = _p34;
				if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
					return _elm_community$lazy_list$Lazy_List$Nil;
				} else {
					var _p36 = _elm_lang$lazy$Lazy$force(list);
					if (_p36.ctor === 'Nil') {
						return _elm_community$lazy_list$Lazy_List$Nil;
					} else {
						return A2(
							_elm_community$lazy_list$Lazy_List$Cons,
							_p36._0,
							A2(_elm_community$lazy_list$Lazy_List$take, n - 1, _p36._1));
					}
				}
			});
	});
var _elm_community$lazy_list$Lazy_List$takeWhile = F2(
	function (predicate, list) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p37) {
				var _p38 = _p37;
				var _p39 = _elm_lang$lazy$Lazy$force(list);
				if (_p39.ctor === 'Nil') {
					return _elm_community$lazy_list$Lazy_List$Nil;
				} else {
					var _p40 = _p39._0;
					return predicate(_p40) ? A2(
						_elm_community$lazy_list$Lazy_List$Cons,
						_p40,
						A2(_elm_community$lazy_list$Lazy_List$takeWhile, predicate, _p39._1)) : _elm_community$lazy_list$Lazy_List$Nil;
				}
			});
	});
var _elm_community$lazy_list$Lazy_List$drop = F2(
	function (n, list) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p41) {
				var _p42 = _p41;
				if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
					return _elm_lang$lazy$Lazy$force(list);
				} else {
					var _p43 = _elm_lang$lazy$Lazy$force(list);
					if (_p43.ctor === 'Nil') {
						return _elm_community$lazy_list$Lazy_List$Nil;
					} else {
						return _elm_lang$lazy$Lazy$force(
							A2(_elm_community$lazy_list$Lazy_List$drop, n - 1, _p43._1));
					}
				}
			});
	});
var _elm_community$lazy_list$Lazy_List$dropWhile = F2(
	function (predicate, list) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p44) {
				var _p45 = _p44;
				var _p46 = _elm_lang$lazy$Lazy$force(list);
				if (_p46.ctor === 'Nil') {
					return _elm_community$lazy_list$Lazy_List$Nil;
				} else {
					return predicate(_p46._0) ? _elm_lang$lazy$Lazy$force(
						A2(_elm_community$lazy_list$Lazy_List$dropWhile, predicate, _p46._1)) : _elm_lang$lazy$Lazy$force(list);
				}
			});
	});
var _elm_community$lazy_list$Lazy_List$unique = function (list) {
	return _elm_lang$lazy$Lazy$lazy(
		function (_p47) {
			var _p48 = _p47;
			var _p49 = _elm_lang$lazy$Lazy$force(list);
			if (_p49.ctor === 'Nil') {
				return _elm_community$lazy_list$Lazy_List$Nil;
			} else {
				var _p51 = _p49._1;
				var _p50 = _p49._0;
				return A2(_elm_community$lazy_list$Lazy_List$member, _p50, _p51) ? _elm_lang$lazy$Lazy$force(
					_elm_community$lazy_list$Lazy_List$unique(_p51)) : A2(
					_elm_community$lazy_list$Lazy_List$Cons,
					_p50,
					_elm_community$lazy_list$Lazy_List$unique(_p51));
			}
		});
};
var _elm_community$lazy_list$Lazy_List$keepIf = F2(
	function (predicate, list) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p52) {
				var _p53 = _p52;
				var _p54 = _elm_lang$lazy$Lazy$force(list);
				if (_p54.ctor === 'Nil') {
					return _elm_community$lazy_list$Lazy_List$Nil;
				} else {
					var _p56 = _p54._1;
					var _p55 = _p54._0;
					return predicate(_p55) ? A2(
						_elm_community$lazy_list$Lazy_List$Cons,
						_p55,
						A2(_elm_community$lazy_list$Lazy_List$keepIf, predicate, _p56)) : _elm_lang$lazy$Lazy$force(
						A2(_elm_community$lazy_list$Lazy_List$keepIf, predicate, _p56));
				}
			});
	});
var _elm_community$lazy_list$Lazy_List$dropIf = function (predicate) {
	return _elm_community$lazy_list$Lazy_List$keepIf(
		function (n) {
			return !predicate(n);
		});
};
var _elm_community$lazy_list$Lazy_List$filterMap = F2(
	function (transform, list) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p57) {
				var _p58 = _p57;
				var _p59 = _elm_lang$lazy$Lazy$force(list);
				if (_p59.ctor === 'Nil') {
					return _elm_community$lazy_list$Lazy_List$Nil;
				} else {
					var _p61 = _p59._1;
					var _p60 = transform(_p59._0);
					if (_p60.ctor === 'Just') {
						return A2(
							_elm_community$lazy_list$Lazy_List$Cons,
							_p60._0,
							A2(_elm_community$lazy_list$Lazy_List$filterMap, transform, _p61));
					} else {
						return _elm_lang$lazy$Lazy$force(
							A2(_elm_community$lazy_list$Lazy_List$filterMap, transform, _p61));
					}
				}
			});
	});
var _elm_community$lazy_list$Lazy_List$flatten = function (list) {
	return _elm_lang$lazy$Lazy$lazy(
		function (_p62) {
			var _p63 = _p62;
			var _p64 = _elm_lang$lazy$Lazy$force(list);
			if (_p64.ctor === 'Nil') {
				return _elm_community$lazy_list$Lazy_List$Nil;
			} else {
				return _elm_lang$lazy$Lazy$force(
					A2(
						_elm_community$lazy_list$Lazy_List_ops['+++'],
						_p64._0,
						_elm_community$lazy_list$Lazy_List$flatten(_p64._1)));
			}
		});
};
var _elm_community$lazy_list$Lazy_List$map = F2(
	function (f, list) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p65) {
				var _p66 = _p65;
				var _p67 = _elm_lang$lazy$Lazy$force(list);
				if (_p67.ctor === 'Nil') {
					return _elm_community$lazy_list$Lazy_List$Nil;
				} else {
					return A2(
						_elm_community$lazy_list$Lazy_List$Cons,
						f(_p67._0),
						A2(_elm_community$lazy_list$Lazy_List$map, f, _p67._1));
				}
			});
	});
var _elm_community$lazy_list$Lazy_List$andThen = F2(
	function (f, list) {
		return _elm_community$lazy_list$Lazy_List$flatten(
			A2(_elm_community$lazy_list$Lazy_List$map, f, list));
	});
var _elm_community$lazy_list$Lazy_List$map2 = F3(
	function (f, list1, list2) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p68) {
				var _p69 = _p68;
				var _p70 = _elm_lang$lazy$Lazy$force(list1);
				if (_p70.ctor === 'Nil') {
					return _elm_community$lazy_list$Lazy_List$Nil;
				} else {
					var _p71 = _elm_lang$lazy$Lazy$force(list2);
					if (_p71.ctor === 'Nil') {
						return _elm_community$lazy_list$Lazy_List$Nil;
					} else {
						return A2(
							_elm_community$lazy_list$Lazy_List$Cons,
							A2(f, _p70._0, _p71._0),
							A3(_elm_community$lazy_list$Lazy_List$map2, f, _p70._1, _p71._1));
					}
				}
			});
	});
var _elm_community$lazy_list$Lazy_List$andMap = F2(
	function (listVal, listFuncs) {
		return A3(
			_elm_community$lazy_list$Lazy_List$map2,
			F2(
				function (x, y) {
					return x(y);
				}),
			listFuncs,
			listVal);
	});
var _elm_community$lazy_list$Lazy_List$zip = _elm_community$lazy_list$Lazy_List$map2(
	F2(
		function (v0, v1) {
			return {ctor: '_Tuple2', _0: v0, _1: v1};
		}));
var _elm_community$lazy_list$Lazy_List$map3 = F4(
	function (f, list1, list2, list3) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p72) {
				var _p73 = _p72;
				var _p74 = _elm_lang$lazy$Lazy$force(list1);
				if (_p74.ctor === 'Nil') {
					return _elm_community$lazy_list$Lazy_List$Nil;
				} else {
					var _p75 = _elm_lang$lazy$Lazy$force(list2);
					if (_p75.ctor === 'Nil') {
						return _elm_community$lazy_list$Lazy_List$Nil;
					} else {
						var _p76 = _elm_lang$lazy$Lazy$force(list3);
						if (_p76.ctor === 'Nil') {
							return _elm_community$lazy_list$Lazy_List$Nil;
						} else {
							return A2(
								_elm_community$lazy_list$Lazy_List$Cons,
								A3(f, _p74._0, _p75._0, _p76._0),
								A4(_elm_community$lazy_list$Lazy_List$map3, f, _p74._1, _p75._1, _p76._1));
						}
					}
				}
			});
	});
var _elm_community$lazy_list$Lazy_List$zip3 = _elm_community$lazy_list$Lazy_List$map3(
	F3(
		function (v0, v1, v2) {
			return {ctor: '_Tuple3', _0: v0, _1: v1, _2: v2};
		}));
var _elm_community$lazy_list$Lazy_List$map4 = F5(
	function (f, list1, list2, list3, list4) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p77) {
				var _p78 = _p77;
				var _p79 = _elm_lang$lazy$Lazy$force(list1);
				if (_p79.ctor === 'Nil') {
					return _elm_community$lazy_list$Lazy_List$Nil;
				} else {
					var _p80 = _elm_lang$lazy$Lazy$force(list2);
					if (_p80.ctor === 'Nil') {
						return _elm_community$lazy_list$Lazy_List$Nil;
					} else {
						var _p81 = _elm_lang$lazy$Lazy$force(list3);
						if (_p81.ctor === 'Nil') {
							return _elm_community$lazy_list$Lazy_List$Nil;
						} else {
							var _p82 = _elm_lang$lazy$Lazy$force(list4);
							if (_p82.ctor === 'Nil') {
								return _elm_community$lazy_list$Lazy_List$Nil;
							} else {
								return A2(
									_elm_community$lazy_list$Lazy_List$Cons,
									A4(f, _p79._0, _p80._0, _p81._0, _p82._0),
									A5(_elm_community$lazy_list$Lazy_List$map4, f, _p79._1, _p80._1, _p81._1, _p82._1));
							}
						}
					}
				}
			});
	});
var _elm_community$lazy_list$Lazy_List$zip4 = _elm_community$lazy_list$Lazy_List$map4(
	F4(
		function (v0, v1, v2, v3) {
			return {ctor: '_Tuple4', _0: v0, _1: v1, _2: v2, _3: v3};
		}));
var _elm_community$lazy_list$Lazy_List$map5 = F6(
	function (f, list1, list2, list3, list4, list5) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p83) {
				var _p84 = _p83;
				var _p85 = _elm_lang$lazy$Lazy$force(list1);
				if (_p85.ctor === 'Nil') {
					return _elm_community$lazy_list$Lazy_List$Nil;
				} else {
					var _p86 = _elm_lang$lazy$Lazy$force(list2);
					if (_p86.ctor === 'Nil') {
						return _elm_community$lazy_list$Lazy_List$Nil;
					} else {
						var _p87 = _elm_lang$lazy$Lazy$force(list3);
						if (_p87.ctor === 'Nil') {
							return _elm_community$lazy_list$Lazy_List$Nil;
						} else {
							var _p88 = _elm_lang$lazy$Lazy$force(list4);
							if (_p88.ctor === 'Nil') {
								return _elm_community$lazy_list$Lazy_List$Nil;
							} else {
								var _p89 = _elm_lang$lazy$Lazy$force(list5);
								if (_p89.ctor === 'Nil') {
									return _elm_community$lazy_list$Lazy_List$Nil;
								} else {
									return A2(
										_elm_community$lazy_list$Lazy_List$Cons,
										A5(f, _p85._0, _p86._0, _p87._0, _p88._0, _p89._0),
										A6(_elm_community$lazy_list$Lazy_List$map5, f, _p85._1, _p86._1, _p87._1, _p88._1, _p89._1));
								}
							}
						}
					}
				}
			});
	});
var _elm_community$lazy_list$Lazy_List$zip5 = _elm_community$lazy_list$Lazy_List$map5(
	F5(
		function (v0, v1, v2, v3, v4) {
			return {ctor: '_Tuple5', _0: v0, _1: v1, _2: v2, _3: v3, _4: v4};
		}));
var _elm_community$lazy_list$Lazy_List$product2 = F2(
	function (list1, list2) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p90) {
				var _p91 = _p90;
				var _p92 = _elm_lang$lazy$Lazy$force(list1);
				if (_p92.ctor === 'Nil') {
					return _elm_community$lazy_list$Lazy_List$Nil;
				} else {
					var _p93 = _elm_lang$lazy$Lazy$force(list2);
					if (_p93.ctor === 'Nil') {
						return _elm_community$lazy_list$Lazy_List$Nil;
					} else {
						return _elm_lang$lazy$Lazy$force(
							A2(
								_elm_community$lazy_list$Lazy_List_ops['+++'],
								A2(
									_elm_community$lazy_list$Lazy_List$map,
									F2(
										function (v0, v1) {
											return {ctor: '_Tuple2', _0: v0, _1: v1};
										})(_p92._0),
									list2),
								A2(_elm_community$lazy_list$Lazy_List$product2, _p92._1, list2)));
					}
				}
			});
	});
var _elm_community$lazy_list$Lazy_List$product3 = F3(
	function (list1, list2, list3) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p94) {
				var _p95 = _p94;
				var _p96 = _elm_lang$lazy$Lazy$force(list1);
				if (_p96.ctor === 'Nil') {
					return _elm_community$lazy_list$Lazy_List$Nil;
				} else {
					return _elm_lang$lazy$Lazy$force(
						A2(
							_elm_community$lazy_list$Lazy_List_ops['+++'],
							A2(
								_elm_community$lazy_list$Lazy_List$map,
								function (_p97) {
									var _p98 = _p97;
									return {ctor: '_Tuple3', _0: _p96._0, _1: _p98._0, _2: _p98._1};
								},
								A2(_elm_community$lazy_list$Lazy_List$product2, list2, list3)),
							A3(_elm_community$lazy_list$Lazy_List$product3, _p96._1, list2, list3)));
				}
			});
	});
var _elm_community$lazy_list$Lazy_List$product4 = F4(
	function (list1, list2, list3, list4) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p99) {
				var _p100 = _p99;
				var _p101 = _elm_lang$lazy$Lazy$force(list1);
				if (_p101.ctor === 'Nil') {
					return _elm_community$lazy_list$Lazy_List$Nil;
				} else {
					return _elm_lang$lazy$Lazy$force(
						A2(
							_elm_community$lazy_list$Lazy_List_ops['+++'],
							A2(
								_elm_community$lazy_list$Lazy_List$map,
								function (_p102) {
									var _p103 = _p102;
									return {ctor: '_Tuple4', _0: _p101._0, _1: _p103._0, _2: _p103._1, _3: _p103._2};
								},
								A3(_elm_community$lazy_list$Lazy_List$product3, list2, list3, list4)),
							A4(_elm_community$lazy_list$Lazy_List$product4, _p101._1, list2, list3, list4)));
				}
			});
	});
var _elm_community$lazy_list$Lazy_List$product5 = F5(
	function (list1, list2, list3, list4, list5) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p104) {
				var _p105 = _p104;
				var _p106 = _elm_lang$lazy$Lazy$force(list1);
				if (_p106.ctor === 'Nil') {
					return _elm_community$lazy_list$Lazy_List$Nil;
				} else {
					return _elm_lang$lazy$Lazy$force(
						A2(
							_elm_community$lazy_list$Lazy_List_ops['+++'],
							A2(
								_elm_community$lazy_list$Lazy_List$map,
								function (_p107) {
									var _p108 = _p107;
									return {ctor: '_Tuple5', _0: _p106._0, _1: _p108._0, _2: _p108._1, _3: _p108._2, _4: _p108._3};
								},
								A4(_elm_community$lazy_list$Lazy_List$product4, list2, list3, list4, list5)),
							A5(_elm_community$lazy_list$Lazy_List$product5, _p106._1, list2, list3, list4, list5)));
				}
			});
	});

var _elm_community$shrink$Shrink$seriesFloat = F2(
	function (low, high) {
		if (_elm_lang$core$Native_Utils.cmp(low, high - 1.0e-4) > -1) {
			return (!_elm_lang$core$Native_Utils.eq(high, 1.0e-6)) ? _elm_community$lazy_list$Lazy_List$singleton(low + 1.0e-6) : _elm_community$lazy_list$Lazy_List$empty;
		} else {
			var low_ = low + ((high - low) / 2);
			return A2(
				_elm_community$lazy_list$Lazy_List_ops[':::'],
				low,
				A2(_elm_community$shrink$Shrink$seriesFloat, low_, high));
		}
	});
var _elm_community$shrink$Shrink$seriesInt = F2(
	function (low, high) {
		if (_elm_lang$core$Native_Utils.cmp(low, high) > -1) {
			return _elm_community$lazy_list$Lazy_List$empty;
		} else {
			if (_elm_lang$core$Native_Utils.eq(low, high - 1)) {
				return A2(_elm_community$lazy_list$Lazy_List_ops[':::'], low, _elm_community$lazy_list$Lazy_List$empty);
			} else {
				var low_ = low + (((high - low) / 2) | 0);
				return A2(
					_elm_community$lazy_list$Lazy_List_ops[':::'],
					low,
					A2(_elm_community$shrink$Shrink$seriesInt, low_, high));
			}
		}
	});
var _elm_community$shrink$Shrink$andMap = _elm_community$lazy_list$Lazy_List$andMap;
var _elm_community$shrink$Shrink$map = _elm_community$lazy_list$Lazy_List$map;
var _elm_community$shrink$Shrink$merge = F3(
	function (shrink1, shrink2, a) {
		return _elm_community$lazy_list$Lazy_List$unique(
			A2(
				_elm_community$lazy_list$Lazy_List_ops['+++'],
				shrink1(a),
				shrink2(a)));
	});
var _elm_community$shrink$Shrink$keepIf = F3(
	function (predicate, shrink, a) {
		return A2(
			_elm_community$lazy_list$Lazy_List$keepIf,
			predicate,
			shrink(a));
	});
var _elm_community$shrink$Shrink$dropIf = function (predicate) {
	return _elm_community$shrink$Shrink$keepIf(
		function (_p0) {
			return !predicate(_p0);
		});
};
var _elm_community$shrink$Shrink$convert = F4(
	function (f, g, shrink, b) {
		return A2(
			_elm_community$lazy_list$Lazy_List$map,
			f,
			shrink(
				g(b)));
	});
var _elm_community$shrink$Shrink$tuple5 = F2(
	function (_p2, _p1) {
		var _p3 = _p2;
		var _p14 = _p3._4;
		var _p13 = _p3._3;
		var _p12 = _p3._2;
		var _p11 = _p3._1;
		var _p10 = _p3._0;
		var _p4 = _p1;
		var _p9 = _p4._4;
		var _p8 = _p4._3;
		var _p7 = _p4._2;
		var _p6 = _p4._1;
		var _p5 = _p4._0;
		return A2(
			_elm_community$lazy_list$Lazy_List_ops['+++'],
			A2(
				_elm_community$lazy_list$Lazy_List$map,
				function (e) {
					return {ctor: '_Tuple5', _0: _p5, _1: _p6, _2: _p7, _3: _p8, _4: e};
				},
				_p14(_p9)),
			A2(
				_elm_community$lazy_list$Lazy_List_ops['+++'],
				A2(
					_elm_community$lazy_list$Lazy_List$map,
					function (d) {
						return {ctor: '_Tuple5', _0: _p5, _1: _p6, _2: _p7, _3: d, _4: _p9};
					},
					_p13(_p8)),
				A2(
					_elm_community$lazy_list$Lazy_List_ops['+++'],
					A2(
						_elm_community$lazy_list$Lazy_List$map,
						function (c) {
							return {ctor: '_Tuple5', _0: _p5, _1: _p6, _2: c, _3: _p8, _4: _p9};
						},
						_p12(_p7)),
					A2(
						_elm_community$lazy_list$Lazy_List_ops['+++'],
						A2(
							_elm_community$lazy_list$Lazy_List$map,
							function (b) {
								return {ctor: '_Tuple5', _0: _p5, _1: b, _2: _p7, _3: _p8, _4: _p9};
							},
							_p11(_p6)),
						A2(
							_elm_community$lazy_list$Lazy_List_ops['+++'],
							A2(
								_elm_community$lazy_list$Lazy_List$map,
								function (a) {
									return {ctor: '_Tuple5', _0: a, _1: _p6, _2: _p7, _3: _p8, _4: _p9};
								},
								_p10(_p5)),
							A2(
								_elm_community$lazy_list$Lazy_List_ops['+++'],
								A3(
									_elm_community$lazy_list$Lazy_List$map2,
									F2(
										function (d, e) {
											return {ctor: '_Tuple5', _0: _p5, _1: _p6, _2: _p7, _3: d, _4: e};
										}),
									_p13(_p8),
									_p14(_p9)),
								A2(
									_elm_community$lazy_list$Lazy_List_ops['+++'],
									A3(
										_elm_community$lazy_list$Lazy_List$map2,
										F2(
											function (c, e) {
												return {ctor: '_Tuple5', _0: _p5, _1: _p6, _2: c, _3: _p8, _4: e};
											}),
										_p12(_p7),
										_p14(_p9)),
									A2(
										_elm_community$lazy_list$Lazy_List_ops['+++'],
										A3(
											_elm_community$lazy_list$Lazy_List$map2,
											F2(
												function (b, e) {
													return {ctor: '_Tuple5', _0: _p5, _1: b, _2: _p7, _3: _p8, _4: e};
												}),
											_p11(_p6),
											_p14(_p9)),
										A2(
											_elm_community$lazy_list$Lazy_List_ops['+++'],
											A3(
												_elm_community$lazy_list$Lazy_List$map2,
												F2(
													function (a, e) {
														return {ctor: '_Tuple5', _0: a, _1: _p6, _2: _p7, _3: _p8, _4: e};
													}),
												_p10(_p5),
												_p14(_p9)),
											A2(
												_elm_community$lazy_list$Lazy_List_ops['+++'],
												A3(
													_elm_community$lazy_list$Lazy_List$map2,
													F2(
														function (c, d) {
															return {ctor: '_Tuple5', _0: _p5, _1: _p6, _2: c, _3: d, _4: _p9};
														}),
													_p12(_p7),
													_p13(_p8)),
												A2(
													_elm_community$lazy_list$Lazy_List_ops['+++'],
													A3(
														_elm_community$lazy_list$Lazy_List$map2,
														F2(
															function (b, d) {
																return {ctor: '_Tuple5', _0: _p5, _1: b, _2: _p7, _3: d, _4: _p9};
															}),
														_p11(_p6),
														_p13(_p8)),
													A2(
														_elm_community$lazy_list$Lazy_List_ops['+++'],
														A3(
															_elm_community$lazy_list$Lazy_List$map2,
															F2(
																function (a, d) {
																	return {ctor: '_Tuple5', _0: a, _1: _p6, _2: _p7, _3: d, _4: _p9};
																}),
															_p10(_p5),
															_p13(_p8)),
														A2(
															_elm_community$lazy_list$Lazy_List_ops['+++'],
															A3(
																_elm_community$lazy_list$Lazy_List$map2,
																F2(
																	function (b, c) {
																		return {ctor: '_Tuple5', _0: _p5, _1: b, _2: c, _3: _p8, _4: _p9};
																	}),
																_p11(_p6),
																_p12(_p7)),
															A2(
																_elm_community$lazy_list$Lazy_List_ops['+++'],
																A3(
																	_elm_community$lazy_list$Lazy_List$map2,
																	F2(
																		function (a, c) {
																			return {ctor: '_Tuple5', _0: a, _1: _p6, _2: c, _3: _p8, _4: _p9};
																		}),
																	_p10(_p5),
																	_p12(_p7)),
																A2(
																	_elm_community$lazy_list$Lazy_List_ops['+++'],
																	A3(
																		_elm_community$lazy_list$Lazy_List$map2,
																		F2(
																			function (a, b) {
																				return {ctor: '_Tuple5', _0: a, _1: b, _2: _p7, _3: _p8, _4: _p9};
																			}),
																		_p10(_p5),
																		_p11(_p6)),
																	A2(
																		_elm_community$lazy_list$Lazy_List_ops['+++'],
																		A4(
																			_elm_community$lazy_list$Lazy_List$map3,
																			F3(
																				function (a, b, c) {
																					return {ctor: '_Tuple5', _0: a, _1: b, _2: c, _3: _p8, _4: _p9};
																				}),
																			_p10(_p5),
																			_p11(_p6),
																			_p12(_p7)),
																		A2(
																			_elm_community$lazy_list$Lazy_List_ops['+++'],
																			A4(
																				_elm_community$lazy_list$Lazy_List$map3,
																				F3(
																					function (a, b, d) {
																						return {ctor: '_Tuple5', _0: a, _1: b, _2: _p7, _3: d, _4: _p9};
																					}),
																				_p10(_p5),
																				_p11(_p6),
																				_p13(_p8)),
																			A2(
																				_elm_community$lazy_list$Lazy_List_ops['+++'],
																				A4(
																					_elm_community$lazy_list$Lazy_List$map3,
																					F3(
																						function (a, c, d) {
																							return {ctor: '_Tuple5', _0: a, _1: _p6, _2: c, _3: d, _4: _p9};
																						}),
																					_p10(_p5),
																					_p12(_p7),
																					_p13(_p8)),
																				A2(
																					_elm_community$lazy_list$Lazy_List_ops['+++'],
																					A4(
																						_elm_community$lazy_list$Lazy_List$map3,
																						F3(
																							function (b, c, d) {
																								return {ctor: '_Tuple5', _0: _p5, _1: b, _2: c, _3: d, _4: _p9};
																							}),
																						_p11(_p6),
																						_p12(_p7),
																						_p13(_p8)),
																					A2(
																						_elm_community$lazy_list$Lazy_List_ops['+++'],
																						A4(
																							_elm_community$lazy_list$Lazy_List$map3,
																							F3(
																								function (a, b, e) {
																									return {ctor: '_Tuple5', _0: a, _1: b, _2: _p7, _3: _p8, _4: e};
																								}),
																							_p10(_p5),
																							_p11(_p6),
																							_p14(_p9)),
																						A2(
																							_elm_community$lazy_list$Lazy_List_ops['+++'],
																							A4(
																								_elm_community$lazy_list$Lazy_List$map3,
																								F3(
																									function (a, c, e) {
																										return {ctor: '_Tuple5', _0: a, _1: _p6, _2: c, _3: _p8, _4: e};
																									}),
																								_p10(_p5),
																								_p12(_p7),
																								_p14(_p9)),
																							A2(
																								_elm_community$lazy_list$Lazy_List_ops['+++'],
																								A4(
																									_elm_community$lazy_list$Lazy_List$map3,
																									F3(
																										function (b, c, e) {
																											return {ctor: '_Tuple5', _0: _p5, _1: b, _2: c, _3: _p8, _4: e};
																										}),
																									_p11(_p6),
																									_p12(_p7),
																									_p14(_p9)),
																								A2(
																									_elm_community$lazy_list$Lazy_List_ops['+++'],
																									A4(
																										_elm_community$lazy_list$Lazy_List$map3,
																										F3(
																											function (a, d, e) {
																												return {ctor: '_Tuple5', _0: a, _1: _p6, _2: _p7, _3: d, _4: e};
																											}),
																										_p10(_p5),
																										_p13(_p8),
																										_p14(_p9)),
																									A2(
																										_elm_community$lazy_list$Lazy_List_ops['+++'],
																										A4(
																											_elm_community$lazy_list$Lazy_List$map3,
																											F3(
																												function (b, d, e) {
																													return {ctor: '_Tuple5', _0: _p5, _1: b, _2: _p7, _3: d, _4: e};
																												}),
																											_p11(_p6),
																											_p13(_p8),
																											_p14(_p9)),
																										A2(
																											_elm_community$lazy_list$Lazy_List_ops['+++'],
																											A4(
																												_elm_community$lazy_list$Lazy_List$map3,
																												F3(
																													function (c, d, e) {
																														return {ctor: '_Tuple5', _0: _p5, _1: _p6, _2: c, _3: d, _4: e};
																													}),
																												_p12(_p7),
																												_p13(_p8),
																												_p14(_p9)),
																											A2(
																												_elm_community$lazy_list$Lazy_List_ops['+++'],
																												A5(
																													_elm_community$lazy_list$Lazy_List$map4,
																													F4(
																														function (b, c, d, e) {
																															return {ctor: '_Tuple5', _0: _p5, _1: b, _2: c, _3: d, _4: e};
																														}),
																													_p11(_p6),
																													_p12(_p7),
																													_p13(_p8),
																													_p14(_p9)),
																												A2(
																													_elm_community$lazy_list$Lazy_List_ops['+++'],
																													A5(
																														_elm_community$lazy_list$Lazy_List$map4,
																														F4(
																															function (a, c, d, e) {
																																return {ctor: '_Tuple5', _0: a, _1: _p6, _2: c, _3: d, _4: e};
																															}),
																														_p10(_p5),
																														_p12(_p7),
																														_p13(_p8),
																														_p14(_p9)),
																													A2(
																														_elm_community$lazy_list$Lazy_List_ops['+++'],
																														A5(
																															_elm_community$lazy_list$Lazy_List$map4,
																															F4(
																																function (a, b, d, e) {
																																	return {ctor: '_Tuple5', _0: a, _1: b, _2: _p7, _3: d, _4: e};
																																}),
																															_p10(_p5),
																															_p11(_p6),
																															_p13(_p8),
																															_p14(_p9)),
																														A2(
																															_elm_community$lazy_list$Lazy_List_ops['+++'],
																															A5(
																																_elm_community$lazy_list$Lazy_List$map4,
																																F4(
																																	function (a, b, c, d) {
																																		return {ctor: '_Tuple5', _0: a, _1: b, _2: c, _3: d, _4: _p9};
																																	}),
																																_p10(_p5),
																																_p11(_p6),
																																_p12(_p7),
																																_p13(_p8)),
																															A6(
																																_elm_community$lazy_list$Lazy_List$map5,
																																F5(
																																	function (v0, v1, v2, v3, v4) {
																																		return {ctor: '_Tuple5', _0: v0, _1: v1, _2: v2, _3: v3, _4: v4};
																																	}),
																																_p10(_p5),
																																_p11(_p6),
																																_p12(_p7),
																																_p13(_p8),
																																_p14(_p9)))))))))))))))))))))))))))))));
	});
var _elm_community$shrink$Shrink$tuple4 = F2(
	function (_p16, _p15) {
		var _p17 = _p16;
		var _p26 = _p17._3;
		var _p25 = _p17._2;
		var _p24 = _p17._1;
		var _p23 = _p17._0;
		var _p18 = _p15;
		var _p22 = _p18._3;
		var _p21 = _p18._2;
		var _p20 = _p18._1;
		var _p19 = _p18._0;
		return A2(
			_elm_community$lazy_list$Lazy_List_ops['+++'],
			A2(
				_elm_community$lazy_list$Lazy_List$map,
				function (d) {
					return {ctor: '_Tuple4', _0: _p19, _1: _p20, _2: _p21, _3: d};
				},
				_p26(_p22)),
			A2(
				_elm_community$lazy_list$Lazy_List_ops['+++'],
				A2(
					_elm_community$lazy_list$Lazy_List$map,
					function (c) {
						return {ctor: '_Tuple4', _0: _p19, _1: _p20, _2: c, _3: _p22};
					},
					_p25(_p21)),
				A2(
					_elm_community$lazy_list$Lazy_List_ops['+++'],
					A2(
						_elm_community$lazy_list$Lazy_List$map,
						function (b) {
							return {ctor: '_Tuple4', _0: _p19, _1: b, _2: _p21, _3: _p22};
						},
						_p24(_p20)),
					A2(
						_elm_community$lazy_list$Lazy_List_ops['+++'],
						A2(
							_elm_community$lazy_list$Lazy_List$map,
							function (a) {
								return {ctor: '_Tuple4', _0: a, _1: _p20, _2: _p21, _3: _p22};
							},
							_p23(_p19)),
						A2(
							_elm_community$lazy_list$Lazy_List_ops['+++'],
							A3(
								_elm_community$lazy_list$Lazy_List$map2,
								F2(
									function (c, d) {
										return {ctor: '_Tuple4', _0: _p19, _1: _p20, _2: c, _3: d};
									}),
								_p25(_p21),
								_p26(_p22)),
							A2(
								_elm_community$lazy_list$Lazy_List_ops['+++'],
								A3(
									_elm_community$lazy_list$Lazy_List$map2,
									F2(
										function (b, d) {
											return {ctor: '_Tuple4', _0: _p19, _1: b, _2: _p21, _3: d};
										}),
									_p24(_p20),
									_p26(_p22)),
								A2(
									_elm_community$lazy_list$Lazy_List_ops['+++'],
									A3(
										_elm_community$lazy_list$Lazy_List$map2,
										F2(
											function (a, d) {
												return {ctor: '_Tuple4', _0: a, _1: _p20, _2: _p21, _3: d};
											}),
										_p23(_p19),
										_p26(_p22)),
									A2(
										_elm_community$lazy_list$Lazy_List_ops['+++'],
										A3(
											_elm_community$lazy_list$Lazy_List$map2,
											F2(
												function (b, c) {
													return {ctor: '_Tuple4', _0: _p19, _1: b, _2: c, _3: _p22};
												}),
											_p24(_p20),
											_p25(_p21)),
										A2(
											_elm_community$lazy_list$Lazy_List_ops['+++'],
											A3(
												_elm_community$lazy_list$Lazy_List$map2,
												F2(
													function (a, c) {
														return {ctor: '_Tuple4', _0: a, _1: _p20, _2: c, _3: _p22};
													}),
												_p23(_p19),
												_p25(_p21)),
											A2(
												_elm_community$lazy_list$Lazy_List_ops['+++'],
												A3(
													_elm_community$lazy_list$Lazy_List$map2,
													F2(
														function (a, b) {
															return {ctor: '_Tuple4', _0: a, _1: b, _2: _p21, _3: _p22};
														}),
													_p23(_p19),
													_p24(_p20)),
												A2(
													_elm_community$lazy_list$Lazy_List_ops['+++'],
													A4(
														_elm_community$lazy_list$Lazy_List$map3,
														F3(
															function (b, c, d) {
																return {ctor: '_Tuple4', _0: _p19, _1: b, _2: c, _3: d};
															}),
														_p24(_p20),
														_p25(_p21),
														_p26(_p22)),
													A2(
														_elm_community$lazy_list$Lazy_List_ops['+++'],
														A4(
															_elm_community$lazy_list$Lazy_List$map3,
															F3(
																function (a, c, d) {
																	return {ctor: '_Tuple4', _0: a, _1: _p20, _2: c, _3: d};
																}),
															_p23(_p19),
															_p25(_p21),
															_p26(_p22)),
														A2(
															_elm_community$lazy_list$Lazy_List_ops['+++'],
															A4(
																_elm_community$lazy_list$Lazy_List$map3,
																F3(
																	function (a, b, d) {
																		return {ctor: '_Tuple4', _0: a, _1: b, _2: _p21, _3: d};
																	}),
																_p23(_p19),
																_p24(_p20),
																_p26(_p22)),
															A2(
																_elm_community$lazy_list$Lazy_List_ops['+++'],
																A4(
																	_elm_community$lazy_list$Lazy_List$map3,
																	F3(
																		function (a, b, c) {
																			return {ctor: '_Tuple4', _0: a, _1: b, _2: c, _3: _p22};
																		}),
																	_p23(_p19),
																	_p24(_p20),
																	_p25(_p21)),
																A5(
																	_elm_community$lazy_list$Lazy_List$map4,
																	F4(
																		function (v0, v1, v2, v3) {
																			return {ctor: '_Tuple4', _0: v0, _1: v1, _2: v2, _3: v3};
																		}),
																	_p23(_p19),
																	_p24(_p20),
																	_p25(_p21),
																	_p26(_p22))))))))))))))));
	});
var _elm_community$shrink$Shrink$tuple3 = F2(
	function (_p28, _p27) {
		var _p29 = _p28;
		var _p36 = _p29._2;
		var _p35 = _p29._1;
		var _p34 = _p29._0;
		var _p30 = _p27;
		var _p33 = _p30._2;
		var _p32 = _p30._1;
		var _p31 = _p30._0;
		return A2(
			_elm_community$lazy_list$Lazy_List_ops['+++'],
			A2(
				_elm_community$lazy_list$Lazy_List$map,
				function (c) {
					return {ctor: '_Tuple3', _0: _p31, _1: _p32, _2: c};
				},
				_p36(_p33)),
			A2(
				_elm_community$lazy_list$Lazy_List_ops['+++'],
				A2(
					_elm_community$lazy_list$Lazy_List$map,
					function (b) {
						return {ctor: '_Tuple3', _0: _p31, _1: b, _2: _p33};
					},
					_p35(_p32)),
				A2(
					_elm_community$lazy_list$Lazy_List_ops['+++'],
					A2(
						_elm_community$lazy_list$Lazy_List$map,
						function (a) {
							return {ctor: '_Tuple3', _0: a, _1: _p32, _2: _p33};
						},
						_p34(_p31)),
					A2(
						_elm_community$lazy_list$Lazy_List_ops['+++'],
						A3(
							_elm_community$lazy_list$Lazy_List$map2,
							F2(
								function (b, c) {
									return {ctor: '_Tuple3', _0: _p31, _1: b, _2: c};
								}),
							_p35(_p32),
							_p36(_p33)),
						A2(
							_elm_community$lazy_list$Lazy_List_ops['+++'],
							A3(
								_elm_community$lazy_list$Lazy_List$map2,
								F2(
									function (a, c) {
										return {ctor: '_Tuple3', _0: a, _1: _p32, _2: c};
									}),
								_p34(_p31),
								_p36(_p33)),
							A2(
								_elm_community$lazy_list$Lazy_List_ops['+++'],
								A3(
									_elm_community$lazy_list$Lazy_List$map2,
									F2(
										function (a, b) {
											return {ctor: '_Tuple3', _0: a, _1: b, _2: _p33};
										}),
									_p34(_p31),
									_p35(_p32)),
								A4(
									_elm_community$lazy_list$Lazy_List$map3,
									F3(
										function (v0, v1, v2) {
											return {ctor: '_Tuple3', _0: v0, _1: v1, _2: v2};
										}),
									_p34(_p31),
									_p35(_p32),
									_p36(_p33))))))));
	});
var _elm_community$shrink$Shrink$tuple = F2(
	function (_p38, _p37) {
		var _p39 = _p38;
		var _p44 = _p39._1;
		var _p43 = _p39._0;
		var _p40 = _p37;
		var _p42 = _p40._1;
		var _p41 = _p40._0;
		return A2(
			_elm_community$lazy_list$Lazy_List_ops['+++'],
			A2(
				_elm_community$lazy_list$Lazy_List$map,
				F2(
					function (v0, v1) {
						return {ctor: '_Tuple2', _0: v0, _1: v1};
					})(_p41),
				_p44(_p42)),
			A2(
				_elm_community$lazy_list$Lazy_List_ops['+++'],
				A2(
					_elm_community$lazy_list$Lazy_List$map,
					A2(
						_elm_lang$core$Basics$flip,
						F2(
							function (v0, v1) {
								return {ctor: '_Tuple2', _0: v0, _1: v1};
							}),
						_p42),
					_p43(_p41)),
				A3(
					_elm_community$lazy_list$Lazy_List$map2,
					F2(
						function (v0, v1) {
							return {ctor: '_Tuple2', _0: v0, _1: v1};
						}),
					_p43(_p41),
					_p44(_p42))));
	});
var _elm_community$shrink$Shrink$lazylist = F2(
	function (shrink, l) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p45) {
				var _p46 = _p45;
				var removes = F3(
					function (k, n, l) {
						return _elm_lang$lazy$Lazy$lazy(
							function (_p47) {
								var _p48 = _p47;
								if (_elm_lang$core$Native_Utils.cmp(k, n) > 0) {
									return _elm_lang$lazy$Lazy$force(_elm_community$lazy_list$Lazy_List$empty);
								} else {
									if (_elm_community$lazy_list$Lazy_List$isEmpty(l)) {
										return _elm_lang$lazy$Lazy$force(
											A2(_elm_community$lazy_list$Lazy_List_ops[':::'], _elm_community$lazy_list$Lazy_List$empty, _elm_community$lazy_list$Lazy_List$empty));
									} else {
										var rest = A2(_elm_community$lazy_list$Lazy_List$drop, k, l);
										var first = A2(_elm_community$lazy_list$Lazy_List$take, k, l);
										return _elm_lang$lazy$Lazy$force(
											A2(
												_elm_community$lazy_list$Lazy_List_ops[':::'],
												rest,
												A2(
													_elm_community$lazy_list$Lazy_List$map,
													F2(
														function (x, y) {
															return A2(_elm_community$lazy_list$Lazy_List_ops['+++'], x, y);
														})(first),
													A3(removes, k, n - k, rest))));
									}
								}
							});
					});
				var shrinkOne = function (l) {
					return _elm_lang$lazy$Lazy$lazy(
						function (_p49) {
							var _p50 = _p49;
							var _p51 = _elm_lang$lazy$Lazy$force(l);
							if (_p51.ctor === 'Nil') {
								return _elm_lang$lazy$Lazy$force(_elm_community$lazy_list$Lazy_List$empty);
							} else {
								var _p53 = _p51._1;
								var _p52 = _p51._0;
								return _elm_lang$lazy$Lazy$force(
									A2(
										_elm_community$lazy_list$Lazy_List_ops['+++'],
										A2(
											_elm_community$lazy_list$Lazy_List$map,
											A2(
												_elm_lang$core$Basics$flip,
												F2(
													function (x, y) {
														return A2(_elm_community$lazy_list$Lazy_List_ops[':::'], x, y);
													}),
												_p53),
											shrink(_p52)),
										A2(
											_elm_community$lazy_list$Lazy_List$map,
											F2(
												function (x, y) {
													return A2(_elm_community$lazy_list$Lazy_List_ops[':::'], x, y);
												})(_p52),
											shrinkOne(_p53))));
							}
						});
				};
				var n = _elm_community$lazy_list$Lazy_List$length(l);
				return _elm_lang$lazy$Lazy$force(
					A2(
						_elm_community$lazy_list$Lazy_List_ops['+++'],
						A2(
							_elm_community$lazy_list$Lazy_List$andThen,
							function (k) {
								return A3(removes, k, n, l);
							},
							A2(
								_elm_community$lazy_list$Lazy_List$takeWhile,
								function (x) {
									return _elm_lang$core$Native_Utils.cmp(x, 0) > 0;
								},
								A2(
									_elm_community$lazy_list$Lazy_List$iterate,
									function (n) {
										return (n / 2) | 0;
									},
									n))),
						shrinkOne(l)));
			});
	});
var _elm_community$shrink$Shrink$list = function (shrink) {
	return A3(
		_elm_community$shrink$Shrink$convert,
		_elm_community$lazy_list$Lazy_List$toList,
		_elm_community$lazy_list$Lazy_List$fromList,
		_elm_community$shrink$Shrink$lazylist(shrink));
};
var _elm_community$shrink$Shrink$array = function (shrink) {
	return A3(
		_elm_community$shrink$Shrink$convert,
		_elm_community$lazy_list$Lazy_List$toArray,
		_elm_community$lazy_list$Lazy_List$fromArray,
		_elm_community$shrink$Shrink$lazylist(shrink));
};
var _elm_community$shrink$Shrink$result = F3(
	function (shrinkError, shrinkValue, r) {
		var _p54 = r;
		if (_p54.ctor === 'Ok') {
			return A2(
				_elm_community$lazy_list$Lazy_List$map,
				_elm_lang$core$Result$Ok,
				shrinkValue(_p54._0));
		} else {
			return A2(
				_elm_community$lazy_list$Lazy_List$map,
				_elm_lang$core$Result$Err,
				shrinkError(_p54._0));
		}
	});
var _elm_community$shrink$Shrink$maybe = F2(
	function (shrink, m) {
		var _p55 = m;
		if (_p55.ctor === 'Just') {
			return A2(
				_elm_community$lazy_list$Lazy_List_ops[':::'],
				_elm_lang$core$Maybe$Nothing,
				A2(
					_elm_community$lazy_list$Lazy_List$map,
					_elm_lang$core$Maybe$Just,
					shrink(_p55._0)));
		} else {
			return _elm_community$lazy_list$Lazy_List$empty;
		}
	});
var _elm_community$shrink$Shrink$atLeastFloat = F2(
	function (min, n) {
		return ((_elm_lang$core$Native_Utils.cmp(n, 0) < 0) && (_elm_lang$core$Native_Utils.cmp(n, min) > -1)) ? A2(
			_elm_community$lazy_list$Lazy_List_ops[':::'],
			0 - n,
			A2(
				_elm_community$lazy_list$Lazy_List$map,
				F2(
					function (x, y) {
						return x * y;
					})(-1),
				A2(_elm_community$shrink$Shrink$seriesFloat, 0, 0 - n))) : A2(
			_elm_community$shrink$Shrink$seriesFloat,
			A2(_elm_lang$core$Basics$max, 0, min),
			n);
	});
var _elm_community$shrink$Shrink$float = function (n) {
	return (_elm_lang$core$Native_Utils.cmp(n, 0) < 0) ? A2(
		_elm_community$lazy_list$Lazy_List_ops[':::'],
		0 - n,
		A2(
			_elm_community$lazy_list$Lazy_List$map,
			F2(
				function (x, y) {
					return x * y;
				})(-1),
			A2(_elm_community$shrink$Shrink$seriesFloat, 0, 0 - n))) : A2(_elm_community$shrink$Shrink$seriesFloat, 0, n);
};
var _elm_community$shrink$Shrink$atLeastInt = F2(
	function (min, n) {
		return ((_elm_lang$core$Native_Utils.cmp(n, 0) < 0) && (_elm_lang$core$Native_Utils.cmp(n, min) > -1)) ? A2(
			_elm_community$lazy_list$Lazy_List_ops[':::'],
			0 - n,
			A2(
				_elm_community$lazy_list$Lazy_List$map,
				F2(
					function (x, y) {
						return x * y;
					})(-1),
				A2(_elm_community$shrink$Shrink$seriesInt, 0, 0 - n))) : A2(
			_elm_community$shrink$Shrink$seriesInt,
			A2(_elm_lang$core$Basics$max, 0, min),
			n);
	});
var _elm_community$shrink$Shrink$atLeastChar = function ($char) {
	return A3(
		_elm_community$shrink$Shrink$convert,
		_elm_lang$core$Char$fromCode,
		_elm_lang$core$Char$toCode,
		_elm_community$shrink$Shrink$atLeastInt(
			_elm_lang$core$Char$toCode($char)));
};
var _elm_community$shrink$Shrink$character = _elm_community$shrink$Shrink$atLeastChar(
	_elm_lang$core$Char$fromCode(32));
var _elm_community$shrink$Shrink$string = A3(
	_elm_community$shrink$Shrink$convert,
	_elm_lang$core$String$fromList,
	_elm_lang$core$String$toList,
	_elm_community$shrink$Shrink$list(_elm_community$shrink$Shrink$character));
var _elm_community$shrink$Shrink$int = function (n) {
	return (_elm_lang$core$Native_Utils.cmp(n, 0) < 0) ? A2(
		_elm_community$lazy_list$Lazy_List_ops[':::'],
		0 - n,
		A2(
			_elm_community$lazy_list$Lazy_List$map,
			F2(
				function (x, y) {
					return x * y;
				})(-1),
			A2(_elm_community$shrink$Shrink$seriesInt, 0, 0 - n))) : A2(_elm_community$shrink$Shrink$seriesInt, 0, n);
};
var _elm_community$shrink$Shrink$char = A3(_elm_community$shrink$Shrink$convert, _elm_lang$core$Char$fromCode, _elm_lang$core$Char$toCode, _elm_community$shrink$Shrink$int);
var _elm_community$shrink$Shrink$order = function (o) {
	var _p56 = o;
	switch (_p56.ctor) {
		case 'GT':
			return A2(
				_elm_community$lazy_list$Lazy_List_ops[':::'],
				_elm_lang$core$Basics$EQ,
				A2(_elm_community$lazy_list$Lazy_List_ops[':::'], _elm_lang$core$Basics$LT, _elm_community$lazy_list$Lazy_List$empty));
		case 'LT':
			return A2(_elm_community$lazy_list$Lazy_List_ops[':::'], _elm_lang$core$Basics$EQ, _elm_community$lazy_list$Lazy_List$empty);
		default:
			return _elm_community$lazy_list$Lazy_List$empty;
	}
};
var _elm_community$shrink$Shrink$bool = function (b) {
	var _p57 = b;
	if (_p57 === true) {
		return A2(_elm_community$lazy_list$Lazy_List_ops[':::'], false, _elm_community$lazy_list$Lazy_List$empty);
	} else {
		return _elm_community$lazy_list$Lazy_List$empty;
	}
};
var _elm_community$shrink$Shrink$noShrink = function (_p58) {
	return _elm_community$lazy_list$Lazy_List$empty;
};
var _elm_community$shrink$Shrink$unit = _elm_community$shrink$Shrink$noShrink;
var _elm_community$shrink$Shrink$shrink = F3(
	function (keepShrinking, shrinker, originalVal) {
		var helper = F2(
			function (lazyList, val) {
				helper:
				while (true) {
					var _p59 = _elm_lang$lazy$Lazy$force(lazyList);
					if (_p59.ctor === 'Nil') {
						return val;
					} else {
						var _p60 = _p59._0;
						if (keepShrinking(_p60)) {
							var _v17 = shrinker(_p60),
								_v18 = _p60;
							lazyList = _v17;
							val = _v18;
							continue helper;
						} else {
							var _v19 = _p59._1,
								_v20 = val;
							lazyList = _v19;
							val = _v20;
							continue helper;
						}
					}
				}
			});
		return A2(
			helper,
			shrinker(originalVal),
			originalVal);
	});

var _elm_lang$core$Native_Bitwise = function() {

return {
	and: F2(function and(a, b) { return a & b; }),
	or: F2(function or(a, b) { return a | b; }),
	xor: F2(function xor(a, b) { return a ^ b; }),
	complement: function complement(a) { return ~a; },
	shiftLeftBy: F2(function(offset, a) { return a << offset; }),
	shiftRightBy: F2(function(offset, a) { return a >> offset; }),
	shiftRightZfBy: F2(function(offset, a) { return a >>> offset; })
};

}();

var _elm_lang$core$Bitwise$shiftRightZfBy = _elm_lang$core$Native_Bitwise.shiftRightZfBy;
var _elm_lang$core$Bitwise$shiftRightBy = _elm_lang$core$Native_Bitwise.shiftRightBy;
var _elm_lang$core$Bitwise$shiftLeftBy = _elm_lang$core$Native_Bitwise.shiftLeftBy;
var _elm_lang$core$Bitwise$complement = _elm_lang$core$Native_Bitwise.complement;
var _elm_lang$core$Bitwise$xor = _elm_lang$core$Native_Bitwise.xor;
var _elm_lang$core$Bitwise$or = _elm_lang$core$Native_Bitwise.or;
var _elm_lang$core$Bitwise$and = _elm_lang$core$Native_Bitwise.and;

//import Maybe, Native.Array, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_Json = function() {


// CORE DECODERS

function succeed(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'succeed',
		msg: msg
	};
}

function fail(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'fail',
		msg: msg
	};
}

function decodePrimitive(tag)
{
	return {
		ctor: '<decoder>',
		tag: tag
	};
}

function decodeContainer(tag, decoder)
{
	return {
		ctor: '<decoder>',
		tag: tag,
		decoder: decoder
	};
}

function decodeNull(value)
{
	return {
		ctor: '<decoder>',
		tag: 'null',
		value: value
	};
}

function decodeField(field, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'field',
		field: field,
		decoder: decoder
	};
}

function decodeIndex(index, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'index',
		index: index,
		decoder: decoder
	};
}

function decodeKeyValuePairs(decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'key-value',
		decoder: decoder
	};
}

function mapMany(f, decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'map-many',
		func: f,
		decoders: decoders
	};
}

function andThen(callback, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'andThen',
		decoder: decoder,
		callback: callback
	};
}

function oneOf(decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'oneOf',
		decoders: decoders
	};
}


// DECODING OBJECTS

function map1(f, d1)
{
	return mapMany(f, [d1]);
}

function map2(f, d1, d2)
{
	return mapMany(f, [d1, d2]);
}

function map3(f, d1, d2, d3)
{
	return mapMany(f, [d1, d2, d3]);
}

function map4(f, d1, d2, d3, d4)
{
	return mapMany(f, [d1, d2, d3, d4]);
}

function map5(f, d1, d2, d3, d4, d5)
{
	return mapMany(f, [d1, d2, d3, d4, d5]);
}

function map6(f, d1, d2, d3, d4, d5, d6)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6]);
}

function map7(f, d1, d2, d3, d4, d5, d6, d7)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
}

function map8(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
}


// DECODE HELPERS

function ok(value)
{
	return { tag: 'ok', value: value };
}

function badPrimitive(type, value)
{
	return { tag: 'primitive', type: type, value: value };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badField(field, nestedProblems)
{
	return { tag: 'field', field: field, rest: nestedProblems };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badOneOf(problems)
{
	return { tag: 'oneOf', problems: problems };
}

function bad(msg)
{
	return { tag: 'fail', msg: msg };
}

function badToString(problem)
{
	var context = '_';
	while (problem)
	{
		switch (problem.tag)
		{
			case 'primitive':
				return 'Expecting ' + problem.type
					+ (context === '_' ? '' : ' at ' + context)
					+ ' but instead got: ' + jsToString(problem.value);

			case 'index':
				context += '[' + problem.index + ']';
				problem = problem.rest;
				break;

			case 'field':
				context += '.' + problem.field;
				problem = problem.rest;
				break;

			case 'oneOf':
				var problems = problem.problems;
				for (var i = 0; i < problems.length; i++)
				{
					problems[i] = badToString(problems[i]);
				}
				return 'I ran into the following problems'
					+ (context === '_' ? '' : ' at ' + context)
					+ ':\n\n' + problems.join('\n');

			case 'fail':
				return 'I ran into a `fail` decoder'
					+ (context === '_' ? '' : ' at ' + context)
					+ ': ' + problem.msg;
		}
	}
}

function jsToString(value)
{
	return value === undefined
		? 'undefined'
		: JSON.stringify(value);
}


// DECODE

function runOnString(decoder, string)
{
	var json;
	try
	{
		json = JSON.parse(string);
	}
	catch (e)
	{
		return _elm_lang$core$Result$Err('Given an invalid JSON: ' + e.message);
	}
	return run(decoder, json);
}

function run(decoder, value)
{
	var result = runHelp(decoder, value);
	return (result.tag === 'ok')
		? _elm_lang$core$Result$Ok(result.value)
		: _elm_lang$core$Result$Err(badToString(result));
}

function runHelp(decoder, value)
{
	switch (decoder.tag)
	{
		case 'bool':
			return (typeof value === 'boolean')
				? ok(value)
				: badPrimitive('a Bool', value);

		case 'int':
			if (typeof value !== 'number') {
				return badPrimitive('an Int', value);
			}

			if (-2147483647 < value && value < 2147483647 && (value | 0) === value) {
				return ok(value);
			}

			if (isFinite(value) && !(value % 1)) {
				return ok(value);
			}

			return badPrimitive('an Int', value);

		case 'float':
			return (typeof value === 'number')
				? ok(value)
				: badPrimitive('a Float', value);

		case 'string':
			return (typeof value === 'string')
				? ok(value)
				: (value instanceof String)
					? ok(value + '')
					: badPrimitive('a String', value);

		case 'null':
			return (value === null)
				? ok(decoder.value)
				: badPrimitive('null', value);

		case 'value':
			return ok(value);

		case 'list':
			if (!(value instanceof Array))
			{
				return badPrimitive('a List', value);
			}

			var list = _elm_lang$core$Native_List.Nil;
			for (var i = value.length; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result)
				}
				list = _elm_lang$core$Native_List.Cons(result.value, list);
			}
			return ok(list);

		case 'array':
			if (!(value instanceof Array))
			{
				return badPrimitive('an Array', value);
			}

			var len = value.length;
			var array = new Array(len);
			for (var i = len; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result);
				}
				array[i] = result.value;
			}
			return ok(_elm_lang$core$Native_Array.fromJSArray(array));

		case 'maybe':
			var result = runHelp(decoder.decoder, value);
			return (result.tag === 'ok')
				? ok(_elm_lang$core$Maybe$Just(result.value))
				: ok(_elm_lang$core$Maybe$Nothing);

		case 'field':
			var field = decoder.field;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return badPrimitive('an object with a field named `' + field + '`', value);
			}

			var result = runHelp(decoder.decoder, value[field]);
			return (result.tag === 'ok') ? result : badField(field, result);

		case 'index':
			var index = decoder.index;
			if (!(value instanceof Array))
			{
				return badPrimitive('an array', value);
			}
			if (index >= value.length)
			{
				return badPrimitive('a longer array. Need index ' + index + ' but there are only ' + value.length + ' entries', value);
			}

			var result = runHelp(decoder.decoder, value[index]);
			return (result.tag === 'ok') ? result : badIndex(index, result);

		case 'key-value':
			if (typeof value !== 'object' || value === null || value instanceof Array)
			{
				return badPrimitive('an object', value);
			}

			var keyValuePairs = _elm_lang$core$Native_List.Nil;
			for (var key in value)
			{
				var result = runHelp(decoder.decoder, value[key]);
				if (result.tag !== 'ok')
				{
					return badField(key, result);
				}
				var pair = _elm_lang$core$Native_Utils.Tuple2(key, result.value);
				keyValuePairs = _elm_lang$core$Native_List.Cons(pair, keyValuePairs);
			}
			return ok(keyValuePairs);

		case 'map-many':
			var answer = decoder.func;
			var decoders = decoder.decoders;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = runHelp(decoders[i], value);
				if (result.tag !== 'ok')
				{
					return result;
				}
				answer = answer(result.value);
			}
			return ok(answer);

		case 'andThen':
			var result = runHelp(decoder.decoder, value);
			return (result.tag !== 'ok')
				? result
				: runHelp(decoder.callback(result.value), value);

		case 'oneOf':
			var errors = [];
			var temp = decoder.decoders;
			while (temp.ctor !== '[]')
			{
				var result = runHelp(temp._0, value);

				if (result.tag === 'ok')
				{
					return result;
				}

				errors.push(result);

				temp = temp._1;
			}
			return badOneOf(errors);

		case 'fail':
			return bad(decoder.msg);

		case 'succeed':
			return ok(decoder.msg);
	}
}


// EQUALITY

function equality(a, b)
{
	if (a === b)
	{
		return true;
	}

	if (a.tag !== b.tag)
	{
		return false;
	}

	switch (a.tag)
	{
		case 'succeed':
		case 'fail':
			return a.msg === b.msg;

		case 'bool':
		case 'int':
		case 'float':
		case 'string':
		case 'value':
			return true;

		case 'null':
			return a.value === b.value;

		case 'list':
		case 'array':
		case 'maybe':
		case 'key-value':
			return equality(a.decoder, b.decoder);

		case 'field':
			return a.field === b.field && equality(a.decoder, b.decoder);

		case 'index':
			return a.index === b.index && equality(a.decoder, b.decoder);

		case 'map-many':
			if (a.func !== b.func)
			{
				return false;
			}
			return listEquality(a.decoders, b.decoders);

		case 'andThen':
			return a.callback === b.callback && equality(a.decoder, b.decoder);

		case 'oneOf':
			return listEquality(a.decoders, b.decoders);
	}
}

function listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

function encode(indentLevel, value)
{
	return JSON.stringify(value, null, indentLevel);
}

function identity(value)
{
	return value;
}

function encodeObject(keyValuePairs)
{
	var obj = {};
	while (keyValuePairs.ctor !== '[]')
	{
		var pair = keyValuePairs._0;
		obj[pair._0] = pair._1;
		keyValuePairs = keyValuePairs._1;
	}
	return obj;
}

return {
	encode: F2(encode),
	runOnString: F2(runOnString),
	run: F2(run),

	decodeNull: decodeNull,
	decodePrimitive: decodePrimitive,
	decodeContainer: F2(decodeContainer),

	decodeField: F2(decodeField),
	decodeIndex: F2(decodeIndex),

	map1: F2(map1),
	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	map6: F7(map6),
	map7: F8(map7),
	map8: F9(map8),
	decodeKeyValuePairs: decodeKeyValuePairs,

	andThen: F2(andThen),
	fail: fail,
	succeed: succeed,
	oneOf: oneOf,

	identity: identity,
	encodeNull: null,
	encodeArray: _elm_lang$core$Native_Array.toJSArray,
	encodeList: _elm_lang$core$Native_List.toArray,
	encodeObject: encodeObject,

	equality: equality
};

}();

var _elm_lang$core$Json_Encode$list = _elm_lang$core$Native_Json.encodeList;
var _elm_lang$core$Json_Encode$array = _elm_lang$core$Native_Json.encodeArray;
var _elm_lang$core$Json_Encode$object = _elm_lang$core$Native_Json.encodeObject;
var _elm_lang$core$Json_Encode$null = _elm_lang$core$Native_Json.encodeNull;
var _elm_lang$core$Json_Encode$bool = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$float = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$int = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$string = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$encode = _elm_lang$core$Native_Json.encode;
var _elm_lang$core$Json_Encode$Value = {ctor: 'Value'};

var _elm_lang$core$Json_Decode$null = _elm_lang$core$Native_Json.decodeNull;
var _elm_lang$core$Json_Decode$value = _elm_lang$core$Native_Json.decodePrimitive('value');
var _elm_lang$core$Json_Decode$andThen = _elm_lang$core$Native_Json.andThen;
var _elm_lang$core$Json_Decode$fail = _elm_lang$core$Native_Json.fail;
var _elm_lang$core$Json_Decode$succeed = _elm_lang$core$Native_Json.succeed;
var _elm_lang$core$Json_Decode$lazy = function (thunk) {
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		thunk,
		_elm_lang$core$Json_Decode$succeed(
			{ctor: '_Tuple0'}));
};
var _elm_lang$core$Json_Decode$decodeValue = _elm_lang$core$Native_Json.run;
var _elm_lang$core$Json_Decode$decodeString = _elm_lang$core$Native_Json.runOnString;
var _elm_lang$core$Json_Decode$map8 = _elm_lang$core$Native_Json.map8;
var _elm_lang$core$Json_Decode$map7 = _elm_lang$core$Native_Json.map7;
var _elm_lang$core$Json_Decode$map6 = _elm_lang$core$Native_Json.map6;
var _elm_lang$core$Json_Decode$map5 = _elm_lang$core$Native_Json.map5;
var _elm_lang$core$Json_Decode$map4 = _elm_lang$core$Native_Json.map4;
var _elm_lang$core$Json_Decode$map3 = _elm_lang$core$Native_Json.map3;
var _elm_lang$core$Json_Decode$map2 = _elm_lang$core$Native_Json.map2;
var _elm_lang$core$Json_Decode$map = _elm_lang$core$Native_Json.map1;
var _elm_lang$core$Json_Decode$oneOf = _elm_lang$core$Native_Json.oneOf;
var _elm_lang$core$Json_Decode$maybe = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'maybe', decoder);
};
var _elm_lang$core$Json_Decode$index = _elm_lang$core$Native_Json.decodeIndex;
var _elm_lang$core$Json_Decode$field = _elm_lang$core$Native_Json.decodeField;
var _elm_lang$core$Json_Decode$at = F2(
	function (fields, decoder) {
		return A3(_elm_lang$core$List$foldr, _elm_lang$core$Json_Decode$field, decoder, fields);
	});
var _elm_lang$core$Json_Decode$keyValuePairs = _elm_lang$core$Native_Json.decodeKeyValuePairs;
var _elm_lang$core$Json_Decode$dict = function (decoder) {
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$Dict$fromList,
		_elm_lang$core$Json_Decode$keyValuePairs(decoder));
};
var _elm_lang$core$Json_Decode$array = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'array', decoder);
};
var _elm_lang$core$Json_Decode$list = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'list', decoder);
};
var _elm_lang$core$Json_Decode$nullable = function (decoder) {
	return _elm_lang$core$Json_Decode$oneOf(
		{
			ctor: '::',
			_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
			_1: {
				ctor: '::',
				_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, decoder),
				_1: {ctor: '[]'}
			}
		});
};
var _elm_lang$core$Json_Decode$float = _elm_lang$core$Native_Json.decodePrimitive('float');
var _elm_lang$core$Json_Decode$int = _elm_lang$core$Native_Json.decodePrimitive('int');
var _elm_lang$core$Json_Decode$bool = _elm_lang$core$Native_Json.decodePrimitive('bool');
var _elm_lang$core$Json_Decode$string = _elm_lang$core$Native_Json.decodePrimitive('string');
var _elm_lang$core$Json_Decode$Decoder = {ctor: 'Decoder'};

var _mgold$elm_random_pcg$Random_Pcg$toJson = function (_p0) {
	var _p1 = _p0;
	return _elm_lang$core$Json_Encode$list(
		{
			ctor: '::',
			_0: _elm_lang$core$Json_Encode$int(_p1._0),
			_1: {
				ctor: '::',
				_0: _elm_lang$core$Json_Encode$int(_p1._1),
				_1: {ctor: '[]'}
			}
		});
};
var _mgold$elm_random_pcg$Random_Pcg$mul32 = F2(
	function (a, b) {
		var bl = b & 65535;
		var bh = 65535 & (b >>> 16);
		var al = a & 65535;
		var ah = 65535 & (a >>> 16);
		return 0 | ((al * bl) + ((((ah * bl) + (al * bh)) << 16) >>> 0));
	});
var _mgold$elm_random_pcg$Random_Pcg$listHelp = F4(
	function (list, n, generate, seed) {
		listHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 1) < 0) {
				return {ctor: '_Tuple2', _0: list, _1: seed};
			} else {
				var _p2 = generate(seed);
				var value = _p2._0;
				var newSeed = _p2._1;
				var _v1 = {ctor: '::', _0: value, _1: list},
					_v2 = n - 1,
					_v3 = generate,
					_v4 = newSeed;
				list = _v1;
				n = _v2;
				generate = _v3;
				seed = _v4;
				continue listHelp;
			}
		}
	});
var _mgold$elm_random_pcg$Random_Pcg$minInt = -2147483648;
var _mgold$elm_random_pcg$Random_Pcg$maxInt = 2147483647;
var _mgold$elm_random_pcg$Random_Pcg$bit27 = 1.34217728e8;
var _mgold$elm_random_pcg$Random_Pcg$bit53 = 9.007199254740992e15;
var _mgold$elm_random_pcg$Random_Pcg$peel = function (_p3) {
	var _p4 = _p3;
	var _p5 = _p4._0;
	var word = (_p5 ^ (_p5 >>> ((_p5 >>> 28) + 4))) * 277803737;
	return ((word >>> 22) ^ word) >>> 0;
};
var _mgold$elm_random_pcg$Random_Pcg$step = F2(
	function (_p6, seed) {
		var _p7 = _p6;
		return _p7._0(seed);
	});
var _mgold$elm_random_pcg$Random_Pcg$retry = F3(
	function (generator, predicate, seed) {
		retry:
		while (true) {
			var _p8 = A2(_mgold$elm_random_pcg$Random_Pcg$step, generator, seed);
			var candidate = _p8._0;
			var newSeed = _p8._1;
			if (predicate(candidate)) {
				return {ctor: '_Tuple2', _0: candidate, _1: newSeed};
			} else {
				var _v7 = generator,
					_v8 = predicate,
					_v9 = newSeed;
				generator = _v7;
				predicate = _v8;
				seed = _v9;
				continue retry;
			}
		}
	});
var _mgold$elm_random_pcg$Random_Pcg$Generator = function (a) {
	return {ctor: 'Generator', _0: a};
};
var _mgold$elm_random_pcg$Random_Pcg$list = F2(
	function (n, _p9) {
		var _p10 = _p9;
		return _mgold$elm_random_pcg$Random_Pcg$Generator(
			function (seed) {
				return A4(
					_mgold$elm_random_pcg$Random_Pcg$listHelp,
					{ctor: '[]'},
					n,
					_p10._0,
					seed);
			});
	});
var _mgold$elm_random_pcg$Random_Pcg$constant = function (value) {
	return _mgold$elm_random_pcg$Random_Pcg$Generator(
		function (seed) {
			return {ctor: '_Tuple2', _0: value, _1: seed};
		});
};
var _mgold$elm_random_pcg$Random_Pcg$map = F2(
	function (func, _p11) {
		var _p12 = _p11;
		return _mgold$elm_random_pcg$Random_Pcg$Generator(
			function (seed0) {
				var _p13 = _p12._0(seed0);
				var a = _p13._0;
				var seed1 = _p13._1;
				return {
					ctor: '_Tuple2',
					_0: func(a),
					_1: seed1
				};
			});
	});
var _mgold$elm_random_pcg$Random_Pcg$map2 = F3(
	function (func, _p15, _p14) {
		var _p16 = _p15;
		var _p17 = _p14;
		return _mgold$elm_random_pcg$Random_Pcg$Generator(
			function (seed0) {
				var _p18 = _p16._0(seed0);
				var a = _p18._0;
				var seed1 = _p18._1;
				var _p19 = _p17._0(seed1);
				var b = _p19._0;
				var seed2 = _p19._1;
				return {
					ctor: '_Tuple2',
					_0: A2(func, a, b),
					_1: seed2
				};
			});
	});
var _mgold$elm_random_pcg$Random_Pcg$pair = F2(
	function (genA, genB) {
		return A3(
			_mgold$elm_random_pcg$Random_Pcg$map2,
			F2(
				function (v0, v1) {
					return {ctor: '_Tuple2', _0: v0, _1: v1};
				}),
			genA,
			genB);
	});
var _mgold$elm_random_pcg$Random_Pcg$andMap = _mgold$elm_random_pcg$Random_Pcg$map2(
	F2(
		function (x, y) {
			return x(y);
		}));
var _mgold$elm_random_pcg$Random_Pcg$map3 = F4(
	function (func, _p22, _p21, _p20) {
		var _p23 = _p22;
		var _p24 = _p21;
		var _p25 = _p20;
		return _mgold$elm_random_pcg$Random_Pcg$Generator(
			function (seed0) {
				var _p26 = _p23._0(seed0);
				var a = _p26._0;
				var seed1 = _p26._1;
				var _p27 = _p24._0(seed1);
				var b = _p27._0;
				var seed2 = _p27._1;
				var _p28 = _p25._0(seed2);
				var c = _p28._0;
				var seed3 = _p28._1;
				return {
					ctor: '_Tuple2',
					_0: A3(func, a, b, c),
					_1: seed3
				};
			});
	});
var _mgold$elm_random_pcg$Random_Pcg$map4 = F5(
	function (func, _p32, _p31, _p30, _p29) {
		var _p33 = _p32;
		var _p34 = _p31;
		var _p35 = _p30;
		var _p36 = _p29;
		return _mgold$elm_random_pcg$Random_Pcg$Generator(
			function (seed0) {
				var _p37 = _p33._0(seed0);
				var a = _p37._0;
				var seed1 = _p37._1;
				var _p38 = _p34._0(seed1);
				var b = _p38._0;
				var seed2 = _p38._1;
				var _p39 = _p35._0(seed2);
				var c = _p39._0;
				var seed3 = _p39._1;
				var _p40 = _p36._0(seed3);
				var d = _p40._0;
				var seed4 = _p40._1;
				return {
					ctor: '_Tuple2',
					_0: A4(func, a, b, c, d),
					_1: seed4
				};
			});
	});
var _mgold$elm_random_pcg$Random_Pcg$map5 = F6(
	function (func, _p45, _p44, _p43, _p42, _p41) {
		var _p46 = _p45;
		var _p47 = _p44;
		var _p48 = _p43;
		var _p49 = _p42;
		var _p50 = _p41;
		return _mgold$elm_random_pcg$Random_Pcg$Generator(
			function (seed0) {
				var _p51 = _p46._0(seed0);
				var a = _p51._0;
				var seed1 = _p51._1;
				var _p52 = _p47._0(seed1);
				var b = _p52._0;
				var seed2 = _p52._1;
				var _p53 = _p48._0(seed2);
				var c = _p53._0;
				var seed3 = _p53._1;
				var _p54 = _p49._0(seed3);
				var d = _p54._0;
				var seed4 = _p54._1;
				var _p55 = _p50._0(seed4);
				var e = _p55._0;
				var seed5 = _p55._1;
				return {
					ctor: '_Tuple2',
					_0: A5(func, a, b, c, d, e),
					_1: seed5
				};
			});
	});
var _mgold$elm_random_pcg$Random_Pcg$andThen = F2(
	function (callback, _p56) {
		var _p57 = _p56;
		return _mgold$elm_random_pcg$Random_Pcg$Generator(
			function (seed) {
				var _p58 = _p57._0(seed);
				var result = _p58._0;
				var newSeed = _p58._1;
				var _p59 = callback(result);
				var generateB = _p59._0;
				return generateB(newSeed);
			});
	});
var _mgold$elm_random_pcg$Random_Pcg$maybe = F2(
	function (genBool, genA) {
		return A2(
			_mgold$elm_random_pcg$Random_Pcg$andThen,
			function (b) {
				return b ? A2(_mgold$elm_random_pcg$Random_Pcg$map, _elm_lang$core$Maybe$Just, genA) : _mgold$elm_random_pcg$Random_Pcg$constant(_elm_lang$core$Maybe$Nothing);
			},
			genBool);
	});
var _mgold$elm_random_pcg$Random_Pcg$filter = F2(
	function (predicate, generator) {
		return _mgold$elm_random_pcg$Random_Pcg$Generator(
			A2(_mgold$elm_random_pcg$Random_Pcg$retry, generator, predicate));
	});
var _mgold$elm_random_pcg$Random_Pcg$Seed = F2(
	function (a, b) {
		return {ctor: 'Seed', _0: a, _1: b};
	});
var _mgold$elm_random_pcg$Random_Pcg$next = function (_p60) {
	var _p61 = _p60;
	var _p62 = _p61._1;
	return A2(_mgold$elm_random_pcg$Random_Pcg$Seed, ((_p61._0 * 1664525) + _p62) >>> 0, _p62);
};
var _mgold$elm_random_pcg$Random_Pcg$initialSeed = function (x) {
	var _p63 = _mgold$elm_random_pcg$Random_Pcg$next(
		A2(_mgold$elm_random_pcg$Random_Pcg$Seed, 0, 1013904223));
	var state1 = _p63._0;
	var incr = _p63._1;
	var state2 = (state1 + x) >>> 0;
	return _mgold$elm_random_pcg$Random_Pcg$next(
		A2(_mgold$elm_random_pcg$Random_Pcg$Seed, state2, incr));
};
var _mgold$elm_random_pcg$Random_Pcg$generate = F2(
	function (toMsg, generator) {
		return A2(
			_elm_lang$core$Task$perform,
			toMsg,
			A2(
				_elm_lang$core$Task$map,
				function (_p64) {
					return _elm_lang$core$Tuple$first(
						A2(
							_mgold$elm_random_pcg$Random_Pcg$step,
							generator,
							_mgold$elm_random_pcg$Random_Pcg$initialSeed(
								_elm_lang$core$Basics$round(_p64))));
				},
				_elm_lang$core$Time$now));
	});
var _mgold$elm_random_pcg$Random_Pcg$int = F2(
	function (a, b) {
		return _mgold$elm_random_pcg$Random_Pcg$Generator(
			function (seed0) {
				var _p65 = (_elm_lang$core$Native_Utils.cmp(a, b) < 0) ? {ctor: '_Tuple2', _0: a, _1: b} : {ctor: '_Tuple2', _0: b, _1: a};
				var lo = _p65._0;
				var hi = _p65._1;
				var range = (hi - lo) + 1;
				if (_elm_lang$core$Native_Utils.eq((range - 1) & range, 0)) {
					return {
						ctor: '_Tuple2',
						_0: (((range - 1) & _mgold$elm_random_pcg$Random_Pcg$peel(seed0)) >>> 0) + lo,
						_1: _mgold$elm_random_pcg$Random_Pcg$next(seed0)
					};
				} else {
					var threshhold = A2(_elm_lang$core$Basics$rem, (0 - range) >>> 0, range) >>> 0;
					var accountForBias = function (seed) {
						accountForBias:
						while (true) {
							var seedN = _mgold$elm_random_pcg$Random_Pcg$next(seed);
							var x = _mgold$elm_random_pcg$Random_Pcg$peel(seed);
							if (_elm_lang$core$Native_Utils.cmp(x, threshhold) < 0) {
								var _v28 = seedN;
								seed = _v28;
								continue accountForBias;
							} else {
								return {
									ctor: '_Tuple2',
									_0: A2(_elm_lang$core$Basics$rem, x, range) + lo,
									_1: seedN
								};
							}
						}
					};
					return accountForBias(seed0);
				}
			});
	});
var _mgold$elm_random_pcg$Random_Pcg$bool = A2(
	_mgold$elm_random_pcg$Random_Pcg$map,
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.eq(x, y);
		})(1),
	A2(_mgold$elm_random_pcg$Random_Pcg$int, 0, 1));
var _mgold$elm_random_pcg$Random_Pcg$choice = F2(
	function (x, y) {
		return A2(
			_mgold$elm_random_pcg$Random_Pcg$map,
			function (b) {
				return b ? x : y;
			},
			_mgold$elm_random_pcg$Random_Pcg$bool);
	});
var _mgold$elm_random_pcg$Random_Pcg$oneIn = function (n) {
	return A2(
		_mgold$elm_random_pcg$Random_Pcg$map,
		F2(
			function (x, y) {
				return _elm_lang$core$Native_Utils.eq(x, y);
			})(1),
		A2(_mgold$elm_random_pcg$Random_Pcg$int, 1, n));
};
var _mgold$elm_random_pcg$Random_Pcg$sample = function () {
	var find = F2(
		function (k, ys) {
			find:
			while (true) {
				var _p66 = ys;
				if (_p66.ctor === '[]') {
					return _elm_lang$core$Maybe$Nothing;
				} else {
					if (_elm_lang$core$Native_Utils.eq(k, 0)) {
						return _elm_lang$core$Maybe$Just(_p66._0);
					} else {
						var _v30 = k - 1,
							_v31 = _p66._1;
						k = _v30;
						ys = _v31;
						continue find;
					}
				}
			}
		});
	return function (xs) {
		return A2(
			_mgold$elm_random_pcg$Random_Pcg$map,
			function (i) {
				return A2(find, i, xs);
			},
			A2(
				_mgold$elm_random_pcg$Random_Pcg$int,
				0,
				_elm_lang$core$List$length(xs) - 1));
	};
}();
var _mgold$elm_random_pcg$Random_Pcg$float = F2(
	function (min, max) {
		return _mgold$elm_random_pcg$Random_Pcg$Generator(
			function (seed0) {
				var range = _elm_lang$core$Basics$abs(max - min);
				var n0 = _mgold$elm_random_pcg$Random_Pcg$peel(seed0);
				var hi = _elm_lang$core$Basics$toFloat(67108863 & n0) * 1.0;
				var seed1 = _mgold$elm_random_pcg$Random_Pcg$next(seed0);
				var n1 = _mgold$elm_random_pcg$Random_Pcg$peel(seed1);
				var lo = _elm_lang$core$Basics$toFloat(134217727 & n1) * 1.0;
				var val = ((hi * _mgold$elm_random_pcg$Random_Pcg$bit27) + lo) / _mgold$elm_random_pcg$Random_Pcg$bit53;
				var scaled = (val * range) + min;
				return {
					ctor: '_Tuple2',
					_0: scaled,
					_1: _mgold$elm_random_pcg$Random_Pcg$next(seed1)
				};
			});
	});
var _mgold$elm_random_pcg$Random_Pcg$frequency = function (pairs) {
	var pick = F2(
		function (choices, n) {
			pick:
			while (true) {
				var _p67 = choices;
				if ((_p67.ctor === '::') && (_p67._0.ctor === '_Tuple2')) {
					var _p68 = _p67._0._0;
					if (_elm_lang$core$Native_Utils.cmp(n, _p68) < 1) {
						return _p67._0._1;
					} else {
						var _v33 = _p67._1,
							_v34 = n - _p68;
						choices = _v33;
						n = _v34;
						continue pick;
					}
				} else {
					return _elm_lang$core$Native_Utils.crashCase(
						'Random.Pcg',
						{
							start: {line: 682, column: 13},
							end: {line: 690, column: 77}
						},
						_p67)('Empty list passed to Random.Pcg.frequency!');
				}
			}
		});
	var total = _elm_lang$core$List$sum(
		A2(
			_elm_lang$core$List$map,
			function (_p70) {
				return _elm_lang$core$Basics$abs(
					_elm_lang$core$Tuple$first(_p70));
			},
			pairs));
	return A2(
		_mgold$elm_random_pcg$Random_Pcg$andThen,
		pick(pairs),
		A2(_mgold$elm_random_pcg$Random_Pcg$float, 0, total));
};
var _mgold$elm_random_pcg$Random_Pcg$choices = function (gens) {
	return _mgold$elm_random_pcg$Random_Pcg$frequency(
		A2(
			_elm_lang$core$List$map,
			function (g) {
				return {ctor: '_Tuple2', _0: 1, _1: g};
			},
			gens));
};
var _mgold$elm_random_pcg$Random_Pcg$independentSeed = _mgold$elm_random_pcg$Random_Pcg$Generator(
	function (seed0) {
		var gen = A2(_mgold$elm_random_pcg$Random_Pcg$int, 0, 4294967295);
		var _p71 = A2(
			_mgold$elm_random_pcg$Random_Pcg$step,
			A4(
				_mgold$elm_random_pcg$Random_Pcg$map3,
				F3(
					function (v0, v1, v2) {
						return {ctor: '_Tuple3', _0: v0, _1: v1, _2: v2};
					}),
				gen,
				gen,
				gen),
			seed0);
		var state = _p71._0._0;
		var b = _p71._0._1;
		var c = _p71._0._2;
		var seed1 = _p71._1;
		var incr = 1 | (b ^ c);
		return {
			ctor: '_Tuple2',
			_0: seed1,
			_1: _mgold$elm_random_pcg$Random_Pcg$next(
				A2(_mgold$elm_random_pcg$Random_Pcg$Seed, state, incr))
		};
	});
var _mgold$elm_random_pcg$Random_Pcg$fastForward = F2(
	function (delta0, _p72) {
		var _p73 = _p72;
		var _p76 = _p73._1;
		var helper = F6(
			function (accMult, accPlus, curMult, curPlus, delta, repeat) {
				helper:
				while (true) {
					var newDelta = delta >>> 1;
					var curMult_ = A2(_mgold$elm_random_pcg$Random_Pcg$mul32, curMult, curMult);
					var curPlus_ = A2(_mgold$elm_random_pcg$Random_Pcg$mul32, curMult + 1, curPlus);
					var _p74 = _elm_lang$core$Native_Utils.eq(delta & 1, 1) ? {
						ctor: '_Tuple2',
						_0: A2(_mgold$elm_random_pcg$Random_Pcg$mul32, accMult, curMult),
						_1: (A2(_mgold$elm_random_pcg$Random_Pcg$mul32, accPlus, curMult) + curPlus) >>> 0
					} : {ctor: '_Tuple2', _0: accMult, _1: accPlus};
					var accMult_ = _p74._0;
					var accPlus_ = _p74._1;
					if (_elm_lang$core$Native_Utils.eq(newDelta, 0)) {
						if ((_elm_lang$core$Native_Utils.cmp(delta0, 0) < 0) && repeat) {
							var _v36 = accMult_,
								_v37 = accPlus_,
								_v38 = curMult_,
								_v39 = curPlus_,
								_v40 = -1,
								_v41 = false;
							accMult = _v36;
							accPlus = _v37;
							curMult = _v38;
							curPlus = _v39;
							delta = _v40;
							repeat = _v41;
							continue helper;
						} else {
							return {ctor: '_Tuple2', _0: accMult_, _1: accPlus_};
						}
					} else {
						var _v42 = accMult_,
							_v43 = accPlus_,
							_v44 = curMult_,
							_v45 = curPlus_,
							_v46 = newDelta,
							_v47 = repeat;
						accMult = _v42;
						accPlus = _v43;
						curMult = _v44;
						curPlus = _v45;
						delta = _v46;
						repeat = _v47;
						continue helper;
					}
				}
			});
		var _p75 = A6(helper, 1, 0, 1664525, _p76, delta0, true);
		var accMultFinal = _p75._0;
		var accPlusFinal = _p75._1;
		return A2(
			_mgold$elm_random_pcg$Random_Pcg$Seed,
			(A2(_mgold$elm_random_pcg$Random_Pcg$mul32, accMultFinal, _p73._0) + accPlusFinal) >>> 0,
			_p76);
	});
var _mgold$elm_random_pcg$Random_Pcg$fromJson = _elm_lang$core$Json_Decode$oneOf(
	{
		ctor: '::',
		_0: A3(
			_elm_lang$core$Json_Decode$map2,
			_mgold$elm_random_pcg$Random_Pcg$Seed,
			A2(_elm_lang$core$Json_Decode$index, 0, _elm_lang$core$Json_Decode$int),
			A2(_elm_lang$core$Json_Decode$index, 1, _elm_lang$core$Json_Decode$int)),
		_1: {
			ctor: '::',
			_0: A2(_elm_lang$core$Json_Decode$map, _mgold$elm_random_pcg$Random_Pcg$initialSeed, _elm_lang$core$Json_Decode$int),
			_1: {ctor: '[]'}
		}
	});

var _elm_community$elm_test$Test_Expectation$Fail = F2(
	function (a, b) {
		return {ctor: 'Fail', _0: a, _1: b};
	});
var _elm_community$elm_test$Test_Expectation$withGiven = F2(
	function (given, outcome) {
		var _p0 = outcome;
		if (_p0.ctor === 'Fail') {
			return A2(_elm_community$elm_test$Test_Expectation$Fail, given, _p0._1);
		} else {
			return outcome;
		}
	});
var _elm_community$elm_test$Test_Expectation$Pass = {ctor: 'Pass'};

var _elm_community$elm_test$Util$lengthString = F2(
	function (charGenerator, stringLength) {
		return A2(
			_mgold$elm_random_pcg$Random_Pcg$map,
			_elm_lang$core$String$fromList,
			A2(_mgold$elm_random_pcg$Random_Pcg$list, stringLength, charGenerator));
	});
var _elm_community$elm_test$Util$rangeLengthString = F3(
	function (minLength, maxLength, charGenerator) {
		return A2(
			_mgold$elm_random_pcg$Random_Pcg$andThen,
			_elm_community$elm_test$Util$lengthString(charGenerator),
			A2(_mgold$elm_random_pcg$Random_Pcg$int, minLength, maxLength));
	});
var _elm_community$elm_test$Util$rangeLengthList = F3(
	function (minLength, maxLength, generator) {
		return A2(
			_mgold$elm_random_pcg$Random_Pcg$andThen,
			function (len) {
				return A2(_mgold$elm_random_pcg$Random_Pcg$list, len, generator);
			},
			A2(_mgold$elm_random_pcg$Random_Pcg$int, minLength, maxLength));
	});
var _elm_community$elm_test$Util$rangeLengthArray = F3(
	function (minLength, maxLength, generator) {
		return A2(
			_mgold$elm_random_pcg$Random_Pcg$map,
			_elm_lang$core$Array$fromList,
			A3(_elm_community$elm_test$Util$rangeLengthList, minLength, maxLength, generator));
	});

var _elm_community$elm_test$RoseTree$children = function (_p0) {
	var _p1 = _p0;
	return _p1._1;
};
var _elm_community$elm_test$RoseTree$root = function (_p2) {
	var _p3 = _p2;
	return _p3._0;
};
var _elm_community$elm_test$RoseTree$Rose = F2(
	function (a, b) {
		return {ctor: 'Rose', _0: a, _1: b};
	});
var _elm_community$elm_test$RoseTree$singleton = function (a) {
	return A2(_elm_community$elm_test$RoseTree$Rose, a, _elm_community$lazy_list$Lazy_List$empty);
};
var _elm_community$elm_test$RoseTree$addChild = F2(
	function (child, _p4) {
		var _p5 = _p4;
		return A2(
			_elm_community$elm_test$RoseTree$Rose,
			_p5._0,
			A2(_elm_community$lazy_list$Lazy_List_ops[':::'], child, _p5._1));
	});
var _elm_community$elm_test$RoseTree$map = F2(
	function (f, _p6) {
		var _p7 = _p6;
		return A2(
			_elm_community$elm_test$RoseTree$Rose,
			f(_p7._0),
			A2(
				_elm_community$lazy_list$Lazy_List$map,
				_elm_community$elm_test$RoseTree$map(f),
				_p7._1));
	});
var _elm_community$elm_test$RoseTree$flatten = function (_p8) {
	var _p9 = _p8;
	return A2(
		_elm_community$elm_test$RoseTree$Rose,
		_p9._0._0,
		A2(
			_elm_community$lazy_list$Lazy_List_ops['+++'],
			_p9._0._1,
			A2(_elm_community$lazy_list$Lazy_List$map, _elm_community$elm_test$RoseTree$flatten, _p9._1)));
};

var _elm_community$elm_test$Fuzz_Internal$unpackGenTree = function (_p0) {
	var _p1 = _p0;
	var _p2 = _p1._0(false);
	if (_p2.ctor === 'Shrink') {
		return _p2._0;
	} else {
		return A2(
			_elm_lang$core$Native_Utils.crash(
				'Fuzz.Internal',
				{
					start: {line: 58, column: 13},
					end: {line: 58, column: 24}
				}),
			'This shouldn\'t happen: Fuzz.Internal.unpackGenTree',
			_p2);
	}
};
var _elm_community$elm_test$Fuzz_Internal$unpackGenVal = function (_p3) {
	var _p4 = _p3;
	var _p5 = _p4._0(true);
	if (_p5.ctor === 'Gen') {
		return _p5._0;
	} else {
		return A2(
			_elm_lang$core$Native_Utils.crash(
				'Fuzz.Internal',
				{
					start: {line: 48, column: 13},
					end: {line: 48, column: 24}
				}),
			'This shouldn\'t happen: Fuzz.Internal.unpackGenVal',
			_p5);
	}
};
var _elm_community$elm_test$Fuzz_Internal$Fuzzer = function (a) {
	return {ctor: 'Fuzzer', _0: a};
};
var _elm_community$elm_test$Fuzz_Internal$Shrink = function (a) {
	return {ctor: 'Shrink', _0: a};
};
var _elm_community$elm_test$Fuzz_Internal$Gen = function (a) {
	return {ctor: 'Gen', _0: a};
};

var _elm_community$elm_test$Fuzz$okOrCrash = function (result) {
	var _p0 = result;
	if (_p0.ctor === 'Ok') {
		return _p0._0;
	} else {
		return _elm_lang$core$Native_Utils.crashCase(
			'Fuzz',
			{
				start: {line: 797, column: 5},
				end: {line: 802, column: 28}
			},
			_p0)(_p0._0);
	}
};
var _elm_community$elm_test$Fuzz$frequency = function (list) {
	return _elm_lang$core$List$isEmpty(list) ? _elm_lang$core$Result$Err('You must provide at least one frequency pair.') : (A2(
		_elm_lang$core$List$any,
		function (_p2) {
			var _p3 = _p2;
			return _elm_lang$core$Native_Utils.cmp(_p3._0, 0) < 0;
		},
		list) ? _elm_lang$core$Result$Err('No frequency weights can be less than 0.') : ((_elm_lang$core$Native_Utils.cmp(
		_elm_lang$core$List$sum(
			A2(_elm_lang$core$List$map, _elm_lang$core$Tuple$first, list)),
		0) < 1) ? _elm_lang$core$Result$Err('Frequency weights must sum to more than 0.') : _elm_lang$core$Result$Ok(
		_elm_community$elm_test$Fuzz_Internal$Fuzzer(
			function (noShrink) {
				return noShrink ? _elm_community$elm_test$Fuzz_Internal$Gen(
					_mgold$elm_random_pcg$Random_Pcg$frequency(
						A2(
							_elm_lang$core$List$map,
							function (_p4) {
								var _p5 = _p4;
								return {
									ctor: '_Tuple2',
									_0: _p5._0,
									_1: _elm_community$elm_test$Fuzz_Internal$unpackGenVal(_p5._1)
								};
							},
							list))) : _elm_community$elm_test$Fuzz_Internal$Shrink(
					_mgold$elm_random_pcg$Random_Pcg$frequency(
						A2(
							_elm_lang$core$List$map,
							function (_p6) {
								var _p7 = _p6;
								return {
									ctor: '_Tuple2',
									_0: _p7._0,
									_1: _elm_community$elm_test$Fuzz_Internal$unpackGenTree(_p7._1)
								};
							},
							list)));
			}))));
};
var _elm_community$elm_test$Fuzz$frequencyOrCrash = function (_p8) {
	return _elm_community$elm_test$Fuzz$okOrCrash(
		_elm_community$elm_test$Fuzz$frequency(_p8));
};
var _elm_community$elm_test$Fuzz$unwindLazyList = function (lazyListOfGenerators) {
	var _p9 = _elm_community$lazy_list$Lazy_List$headAndTail(lazyListOfGenerators);
	if (_p9.ctor === 'Nothing') {
		return _mgold$elm_random_pcg$Random_Pcg$constant(_elm_community$lazy_list$Lazy_List$empty);
	} else {
		return A3(
			_mgold$elm_random_pcg$Random_Pcg$map2,
			_elm_community$lazy_list$Lazy_List$cons,
			_p9._0._0,
			_elm_community$elm_test$Fuzz$unwindLazyList(_p9._0._1));
	}
};
var _elm_community$elm_test$Fuzz$unwindRoseTree = function (_p10) {
	var _p11 = _p10;
	var _p13 = _p11._0;
	var _p12 = _elm_community$lazy_list$Lazy_List$headAndTail(_p11._1);
	if (_p12.ctor === 'Nothing') {
		return A2(_mgold$elm_random_pcg$Random_Pcg$map, _elm_community$elm_test$RoseTree$singleton, _p13);
	} else {
		return A5(
			_mgold$elm_random_pcg$Random_Pcg$map4,
			F4(
				function (a, b, c, d) {
					return A2(
						_elm_community$elm_test$RoseTree$Rose,
						a,
						A2(
							_elm_community$lazy_list$Lazy_List$cons,
							A2(_elm_community$elm_test$RoseTree$Rose, b, c),
							d));
				}),
			_p13,
			_p12._0._0._0,
			_elm_community$elm_test$Fuzz$unwindLazyList(
				A2(_elm_community$lazy_list$Lazy_List$map, _elm_community$elm_test$Fuzz$unwindRoseTree, _p12._0._0._1)),
			_elm_community$elm_test$Fuzz$unwindLazyList(
				A2(_elm_community$lazy_list$Lazy_List$map, _elm_community$elm_test$Fuzz$unwindRoseTree, _p12._0._1)));
	}
};
var _elm_community$elm_test$Fuzz$andThenRoseTrees = F2(
	function (transform, genTree) {
		return A2(
			_mgold$elm_random_pcg$Random_Pcg$andThen,
			function (_p14) {
				var _p15 = _p14;
				var genOtherChildren = A2(
					_mgold$elm_random_pcg$Random_Pcg$map,
					_elm_community$lazy_list$Lazy_List$map(_elm_community$elm_test$RoseTree$flatten),
					_elm_community$elm_test$Fuzz$unwindLazyList(
						A2(
							_elm_community$lazy_list$Lazy_List$map,
							function (rt) {
								return _elm_community$elm_test$Fuzz$unwindRoseTree(
									A2(
										_elm_community$elm_test$RoseTree$map,
										function (_p16) {
											return _elm_community$elm_test$Fuzz_Internal$unpackGenTree(
												transform(_p16));
										},
										rt));
							},
							_p15._1)));
				return A3(
					_mgold$elm_random_pcg$Random_Pcg$map2,
					F2(
						function (_p17, otherChildren) {
							var _p18 = _p17;
							return A2(
								_elm_community$elm_test$RoseTree$Rose,
								_p18._0,
								A2(_elm_community$lazy_list$Lazy_List$append, _p18._1, otherChildren));
						}),
					_elm_community$elm_test$Fuzz_Internal$unpackGenTree(
						transform(_p15._0)),
					genOtherChildren);
			},
			genTree);
	});
var _elm_community$elm_test$Fuzz$andThen = F2(
	function (transform, _p19) {
		var _p20 = _p19;
		return _elm_community$elm_test$Fuzz_Internal$Fuzzer(
			function (noShrink) {
				var _p21 = _p20._0(noShrink);
				if (_p21.ctor === 'Gen') {
					return _elm_community$elm_test$Fuzz_Internal$Gen(
						A2(
							_mgold$elm_random_pcg$Random_Pcg$andThen,
							function (_p22) {
								return _elm_community$elm_test$Fuzz_Internal$unpackGenVal(
									transform(_p22));
							},
							_p21._0));
				} else {
					return _elm_community$elm_test$Fuzz_Internal$Shrink(
						A2(_elm_community$elm_test$Fuzz$andThenRoseTrees, transform, _p21._0));
				}
			});
	});
var _elm_community$elm_test$Fuzz$map = F2(
	function (transform, _p23) {
		var _p24 = _p23;
		return _elm_community$elm_test$Fuzz_Internal$Fuzzer(
			function (noShrink) {
				var _p25 = _p24._0(noShrink);
				if (_p25.ctor === 'Gen') {
					return _elm_community$elm_test$Fuzz_Internal$Gen(
						A2(_mgold$elm_random_pcg$Random_Pcg$map, transform, _p25._0));
				} else {
					return _elm_community$elm_test$Fuzz_Internal$Shrink(
						A2(
							_mgold$elm_random_pcg$Random_Pcg$map,
							_elm_community$elm_test$RoseTree$map(transform),
							_p25._0));
				}
			});
	});
var _elm_community$elm_test$Fuzz$constant = function (x) {
	return _elm_community$elm_test$Fuzz_Internal$Fuzzer(
		function (noShrink) {
			return noShrink ? _elm_community$elm_test$Fuzz_Internal$Gen(
				_mgold$elm_random_pcg$Random_Pcg$constant(x)) : _elm_community$elm_test$Fuzz_Internal$Shrink(
				_mgold$elm_random_pcg$Random_Pcg$constant(
					_elm_community$elm_test$RoseTree$singleton(x)));
		});
};
var _elm_community$elm_test$Fuzz$tupleShrinkHelp5 = F5(
	function (rose1, rose2, rose3, rose4, rose5) {
		var shrink5 = A2(
			_elm_community$lazy_list$Lazy_List$map,
			function (subtree) {
				return A5(_elm_community$elm_test$Fuzz$tupleShrinkHelp5, rose1, rose2, rose3, rose4, subtree);
			},
			_elm_community$elm_test$RoseTree$children(rose5));
		var shrink4 = A2(
			_elm_community$lazy_list$Lazy_List$map,
			function (subtree) {
				return A5(_elm_community$elm_test$Fuzz$tupleShrinkHelp5, rose1, rose2, rose3, subtree, rose5);
			},
			_elm_community$elm_test$RoseTree$children(rose4));
		var shrink3 = A2(
			_elm_community$lazy_list$Lazy_List$map,
			function (subtree) {
				return A5(_elm_community$elm_test$Fuzz$tupleShrinkHelp5, rose1, rose2, subtree, rose4, rose5);
			},
			_elm_community$elm_test$RoseTree$children(rose3));
		var shrink2 = A2(
			_elm_community$lazy_list$Lazy_List$map,
			function (subtree) {
				return A5(_elm_community$elm_test$Fuzz$tupleShrinkHelp5, rose1, subtree, rose3, rose4, rose5);
			},
			_elm_community$elm_test$RoseTree$children(rose2));
		var shrink1 = A2(
			_elm_community$lazy_list$Lazy_List$map,
			function (subtree) {
				return A5(_elm_community$elm_test$Fuzz$tupleShrinkHelp5, subtree, rose2, rose3, rose4, rose5);
			},
			_elm_community$elm_test$RoseTree$children(rose1));
		var root = {
			ctor: '_Tuple5',
			_0: _elm_community$elm_test$RoseTree$root(rose1),
			_1: _elm_community$elm_test$RoseTree$root(rose2),
			_2: _elm_community$elm_test$RoseTree$root(rose3),
			_3: _elm_community$elm_test$RoseTree$root(rose4),
			_4: _elm_community$elm_test$RoseTree$root(rose5)
		};
		return A2(
			_elm_community$elm_test$RoseTree$Rose,
			root,
			A2(
				_elm_community$lazy_list$Lazy_List$append,
				shrink1,
				A2(
					_elm_community$lazy_list$Lazy_List$append,
					shrink2,
					A2(
						_elm_community$lazy_list$Lazy_List$append,
						shrink3,
						A2(_elm_community$lazy_list$Lazy_List$append, shrink4, shrink5)))));
	});
var _elm_community$elm_test$Fuzz$tuple5 = function (_p26) {
	var _p27 = _p26;
	return _elm_community$elm_test$Fuzz_Internal$Fuzzer(
		function (noShrink) {
			var _p28 = {
				ctor: '_Tuple5',
				_0: _p27._0._0(noShrink),
				_1: _p27._1._0(noShrink),
				_2: _p27._2._0(noShrink),
				_3: _p27._3._0(noShrink),
				_4: _p27._4._0(noShrink)
			};
			_v14_2:
			do {
				if (_p28.ctor === '_Tuple5') {
					if (_p28._0.ctor === 'Gen') {
						if ((((_p28._1.ctor === 'Gen') && (_p28._2.ctor === 'Gen')) && (_p28._3.ctor === 'Gen')) && (_p28._4.ctor === 'Gen')) {
							return _elm_community$elm_test$Fuzz_Internal$Gen(
								A6(
									_mgold$elm_random_pcg$Random_Pcg$map5,
									F5(
										function (v0, v1, v2, v3, v4) {
											return {ctor: '_Tuple5', _0: v0, _1: v1, _2: v2, _3: v3, _4: v4};
										}),
									_p28._0._0,
									_p28._1._0,
									_p28._2._0,
									_p28._3._0,
									_p28._4._0));
						} else {
							break _v14_2;
						}
					} else {
						if ((((_p28._1.ctor === 'Shrink') && (_p28._2.ctor === 'Shrink')) && (_p28._3.ctor === 'Shrink')) && (_p28._4.ctor === 'Shrink')) {
							return _elm_community$elm_test$Fuzz_Internal$Shrink(
								A6(_mgold$elm_random_pcg$Random_Pcg$map5, _elm_community$elm_test$Fuzz$tupleShrinkHelp5, _p28._0._0, _p28._1._0, _p28._2._0, _p28._3._0, _p28._4._0));
						} else {
							break _v14_2;
						}
					}
				} else {
					break _v14_2;
				}
			} while(false);
			return A2(
				_elm_lang$core$Native_Utils.crash(
					'Fuzz',
					{
						start: {line: 573, column: 21},
						end: {line: 573, column: 32}
					}),
				'This shouldn\'t happen: Fuzz.tuple5',
				_p28);
		});
};
var _elm_community$elm_test$Fuzz$map5 = F6(
	function (transform, fuzzA, fuzzB, fuzzC, fuzzD, fuzzE) {
		return A2(
			_elm_community$elm_test$Fuzz$map,
			function (_p29) {
				var _p30 = _p29;
				return A5(transform, _p30._0, _p30._1, _p30._2, _p30._3, _p30._4);
			},
			_elm_community$elm_test$Fuzz$tuple5(
				{ctor: '_Tuple5', _0: fuzzA, _1: fuzzB, _2: fuzzC, _3: fuzzD, _4: fuzzE}));
	});
var _elm_community$elm_test$Fuzz$tupleShrinkHelp4 = F4(
	function (rose1, rose2, rose3, rose4) {
		var shrink4 = A2(
			_elm_community$lazy_list$Lazy_List$map,
			function (subtree) {
				return A4(_elm_community$elm_test$Fuzz$tupleShrinkHelp4, rose1, rose2, rose3, subtree);
			},
			_elm_community$elm_test$RoseTree$children(rose4));
		var shrink3 = A2(
			_elm_community$lazy_list$Lazy_List$map,
			function (subtree) {
				return A4(_elm_community$elm_test$Fuzz$tupleShrinkHelp4, rose1, rose2, subtree, rose4);
			},
			_elm_community$elm_test$RoseTree$children(rose3));
		var shrink2 = A2(
			_elm_community$lazy_list$Lazy_List$map,
			function (subtree) {
				return A4(_elm_community$elm_test$Fuzz$tupleShrinkHelp4, rose1, subtree, rose3, rose4);
			},
			_elm_community$elm_test$RoseTree$children(rose2));
		var shrink1 = A2(
			_elm_community$lazy_list$Lazy_List$map,
			function (subtree) {
				return A4(_elm_community$elm_test$Fuzz$tupleShrinkHelp4, subtree, rose2, rose3, rose4);
			},
			_elm_community$elm_test$RoseTree$children(rose1));
		var root = {
			ctor: '_Tuple4',
			_0: _elm_community$elm_test$RoseTree$root(rose1),
			_1: _elm_community$elm_test$RoseTree$root(rose2),
			_2: _elm_community$elm_test$RoseTree$root(rose3),
			_3: _elm_community$elm_test$RoseTree$root(rose4)
		};
		return A2(
			_elm_community$elm_test$RoseTree$Rose,
			root,
			A2(
				_elm_community$lazy_list$Lazy_List$append,
				shrink1,
				A2(
					_elm_community$lazy_list$Lazy_List$append,
					shrink2,
					A2(_elm_community$lazy_list$Lazy_List$append, shrink3, shrink4))));
	});
var _elm_community$elm_test$Fuzz$tuple4 = function (_p31) {
	var _p32 = _p31;
	return _elm_community$elm_test$Fuzz_Internal$Fuzzer(
		function (noShrink) {
			var _p33 = {
				ctor: '_Tuple4',
				_0: _p32._0._0(noShrink),
				_1: _p32._1._0(noShrink),
				_2: _p32._2._0(noShrink),
				_3: _p32._3._0(noShrink)
			};
			_v17_2:
			do {
				if (_p33.ctor === '_Tuple4') {
					if (_p33._0.ctor === 'Gen') {
						if (((_p33._1.ctor === 'Gen') && (_p33._2.ctor === 'Gen')) && (_p33._3.ctor === 'Gen')) {
							return _elm_community$elm_test$Fuzz_Internal$Gen(
								A5(
									_mgold$elm_random_pcg$Random_Pcg$map4,
									F4(
										function (v0, v1, v2, v3) {
											return {ctor: '_Tuple4', _0: v0, _1: v1, _2: v2, _3: v3};
										}),
									_p33._0._0,
									_p33._1._0,
									_p33._2._0,
									_p33._3._0));
						} else {
							break _v17_2;
						}
					} else {
						if (((_p33._1.ctor === 'Shrink') && (_p33._2.ctor === 'Shrink')) && (_p33._3.ctor === 'Shrink')) {
							return _elm_community$elm_test$Fuzz_Internal$Shrink(
								A5(_mgold$elm_random_pcg$Random_Pcg$map4, _elm_community$elm_test$Fuzz$tupleShrinkHelp4, _p33._0._0, _p33._1._0, _p33._2._0, _p33._3._0));
						} else {
							break _v17_2;
						}
					}
				} else {
					break _v17_2;
				}
			} while(false);
			return A2(
				_elm_lang$core$Native_Utils.crash(
					'Fuzz',
					{
						start: {line: 530, column: 21},
						end: {line: 530, column: 32}
					}),
				'This shouldn\'t happen: Fuzz.tuple4',
				_p33);
		});
};
var _elm_community$elm_test$Fuzz$map4 = F5(
	function (transform, fuzzA, fuzzB, fuzzC, fuzzD) {
		return A2(
			_elm_community$elm_test$Fuzz$map,
			function (_p34) {
				var _p35 = _p34;
				return A4(transform, _p35._0, _p35._1, _p35._2, _p35._3);
			},
			_elm_community$elm_test$Fuzz$tuple4(
				{ctor: '_Tuple4', _0: fuzzA, _1: fuzzB, _2: fuzzC, _3: fuzzD}));
	});
var _elm_community$elm_test$Fuzz$tupleShrinkHelp3 = F3(
	function (_p38, _p37, _p36) {
		var _p39 = _p38;
		var _p44 = _p39;
		var _p40 = _p37;
		var _p43 = _p40;
		var _p41 = _p36;
		var _p42 = _p41;
		var shrink3 = A2(
			_elm_community$lazy_list$Lazy_List$map,
			function (subtree) {
				return A3(_elm_community$elm_test$Fuzz$tupleShrinkHelp3, _p44, _p43, subtree);
			},
			_p41._1);
		var shrink2 = A2(
			_elm_community$lazy_list$Lazy_List$map,
			function (subtree) {
				return A3(_elm_community$elm_test$Fuzz$tupleShrinkHelp3, _p44, subtree, _p42);
			},
			_p40._1);
		var shrink1 = A2(
			_elm_community$lazy_list$Lazy_List$map,
			function (subtree) {
				return A3(_elm_community$elm_test$Fuzz$tupleShrinkHelp3, subtree, _p43, _p42);
			},
			_p39._1);
		var root = {ctor: '_Tuple3', _0: _p39._0, _1: _p40._0, _2: _p41._0};
		return A2(
			_elm_community$elm_test$RoseTree$Rose,
			root,
			A2(
				_elm_community$lazy_list$Lazy_List$append,
				shrink1,
				A2(_elm_community$lazy_list$Lazy_List$append, shrink2, shrink3)));
	});
var _elm_community$elm_test$Fuzz$tuple3 = function (_p45) {
	var _p46 = _p45;
	return _elm_community$elm_test$Fuzz_Internal$Fuzzer(
		function (noShrink) {
			var _p47 = {
				ctor: '_Tuple3',
				_0: _p46._0._0(noShrink),
				_1: _p46._1._0(noShrink),
				_2: _p46._2._0(noShrink)
			};
			_v23_2:
			do {
				if (_p47.ctor === '_Tuple3') {
					if (_p47._0.ctor === 'Gen') {
						if ((_p47._1.ctor === 'Gen') && (_p47._2.ctor === 'Gen')) {
							return _elm_community$elm_test$Fuzz_Internal$Gen(
								A4(
									_mgold$elm_random_pcg$Random_Pcg$map3,
									F3(
										function (v0, v1, v2) {
											return {ctor: '_Tuple3', _0: v0, _1: v1, _2: v2};
										}),
									_p47._0._0,
									_p47._1._0,
									_p47._2._0));
						} else {
							break _v23_2;
						}
					} else {
						if ((_p47._1.ctor === 'Shrink') && (_p47._2.ctor === 'Shrink')) {
							return _elm_community$elm_test$Fuzz_Internal$Shrink(
								A4(_mgold$elm_random_pcg$Random_Pcg$map3, _elm_community$elm_test$Fuzz$tupleShrinkHelp3, _p47._0._0, _p47._1._0, _p47._2._0));
						} else {
							break _v23_2;
						}
					}
				} else {
					break _v23_2;
				}
			} while(false);
			return A2(
				_elm_lang$core$Native_Utils.crash(
					'Fuzz',
					{
						start: {line: 491, column: 21},
						end: {line: 491, column: 32}
					}),
				'This shouldn\'t happen: Fuzz.tuple3',
				_p47);
		});
};
var _elm_community$elm_test$Fuzz$map3 = F4(
	function (transform, fuzzA, fuzzB, fuzzC) {
		return A2(
			_elm_community$elm_test$Fuzz$map,
			function (_p48) {
				var _p49 = _p48;
				return A3(transform, _p49._0, _p49._1, _p49._2);
			},
			_elm_community$elm_test$Fuzz$tuple3(
				{ctor: '_Tuple3', _0: fuzzA, _1: fuzzB, _2: fuzzC}));
	});
var _elm_community$elm_test$Fuzz$tupleShrinkHelp = F2(
	function (_p51, _p50) {
		var _p52 = _p51;
		var _p53 = _p50;
		var shrink2 = A2(
			_elm_community$lazy_list$Lazy_List$map,
			function (subtree) {
				return A2(_elm_community$elm_test$Fuzz$tupleShrinkHelp, _p52, subtree);
			},
			_p53._1);
		var shrink1 = A2(
			_elm_community$lazy_list$Lazy_List$map,
			function (subtree) {
				return A2(_elm_community$elm_test$Fuzz$tupleShrinkHelp, subtree, _p53);
			},
			_p52._1);
		var root = {ctor: '_Tuple2', _0: _p52._0, _1: _p53._0};
		return A2(
			_elm_community$elm_test$RoseTree$Rose,
			root,
			A2(_elm_community$lazy_list$Lazy_List$append, shrink1, shrink2));
	});
var _elm_community$elm_test$Fuzz$tuple = function (_p54) {
	var _p55 = _p54;
	return _elm_community$elm_test$Fuzz_Internal$Fuzzer(
		function (noShrink) {
			var _p56 = {
				ctor: '_Tuple2',
				_0: _p55._0._0(noShrink),
				_1: _p55._1._0(noShrink)
			};
			_v28_2:
			do {
				if (_p56.ctor === '_Tuple2') {
					if (_p56._0.ctor === 'Gen') {
						if (_p56._1.ctor === 'Gen') {
							return _elm_community$elm_test$Fuzz_Internal$Gen(
								A3(
									_mgold$elm_random_pcg$Random_Pcg$map2,
									F2(
										function (v0, v1) {
											return {ctor: '_Tuple2', _0: v0, _1: v1};
										}),
									_p56._0._0,
									_p56._1._0));
						} else {
							break _v28_2;
						}
					} else {
						if (_p56._1.ctor === 'Shrink') {
							return _elm_community$elm_test$Fuzz_Internal$Shrink(
								A3(_mgold$elm_random_pcg$Random_Pcg$map2, _elm_community$elm_test$Fuzz$tupleShrinkHelp, _p56._0._0, _p56._1._0));
						} else {
							break _v28_2;
						}
					}
				} else {
					break _v28_2;
				}
			} while(false);
			return A2(
				_elm_lang$core$Native_Utils.crash(
					'Fuzz',
					{
						start: {line: 449, column: 21},
						end: {line: 449, column: 32}
					}),
				'This shouldn\'t happen: Fuzz.tuple',
				_p56);
		});
};
var _elm_community$elm_test$Fuzz$map2 = F3(
	function (transform, fuzzA, fuzzB) {
		return A2(
			_elm_community$elm_test$Fuzz$map,
			function (_p57) {
				var _p58 = _p57;
				return A2(transform, _p58._0, _p58._1);
			},
			_elm_community$elm_test$Fuzz$tuple(
				{ctor: '_Tuple2', _0: fuzzA, _1: fuzzB}));
	});
var _elm_community$elm_test$Fuzz$andMap = _elm_community$elm_test$Fuzz$map2(
	F2(
		function (x, y) {
			return y(x);
		}));
var _elm_community$elm_test$Fuzz$listShrinkHelp = function (listOfTrees) {
	var shorter = F3(
		function (windowSize, aList, recursing) {
			if ((_elm_lang$core$Native_Utils.cmp(
				windowSize,
				_elm_lang$core$List$length(aList)) > 0) || (_elm_lang$core$Native_Utils.eq(
				windowSize,
				_elm_lang$core$List$length(aList)) && (!recursing))) {
				return _elm_community$lazy_list$Lazy_List$empty;
			} else {
				var _p59 = aList;
				if (_p59.ctor === '[]') {
					return _elm_community$lazy_list$Lazy_List$empty;
				} else {
					return A2(
						_elm_community$lazy_list$Lazy_List$cons,
						A2(_elm_lang$core$List$take, windowSize, aList),
						A3(shorter, windowSize, _p59._1, true));
				}
			}
		});
	var shrinkOne = F2(
		function (prefix, list) {
			var _p60 = list;
			if (_p60.ctor === '[]') {
				return _elm_community$lazy_list$Lazy_List$empty;
			} else {
				return A2(
					_elm_community$lazy_list$Lazy_List$map,
					function (childTree) {
						return _elm_community$elm_test$Fuzz$listShrinkHelp(
							A2(
								_elm_lang$core$Basics_ops['++'],
								prefix,
								{ctor: '::', _0: childTree, _1: _p60._1}));
					},
					_p60._0._1);
			}
		});
	var root = A2(_elm_lang$core$List$map, _elm_community$elm_test$RoseTree$root, listOfTrees);
	var n = _elm_lang$core$List$length(listOfTrees);
	var shrunkenVals = A2(
		_elm_community$lazy_list$Lazy_List$andThen,
		function (i) {
			return A2(
				shrinkOne,
				A2(_elm_lang$core$List$take, i, listOfTrees),
				A2(_elm_lang$core$List$drop, i, listOfTrees));
		},
		A2(
			_elm_community$lazy_list$Lazy_List$take,
			n,
			A2(
				_elm_community$lazy_list$Lazy_List$map,
				function (i) {
					return i - 1;
				},
				_elm_community$lazy_list$Lazy_List$numbers)));
	var shortened = A2(
		_elm_community$lazy_list$Lazy_List$map,
		_elm_community$elm_test$Fuzz$listShrinkHelp,
		A2(
			_elm_community$lazy_list$Lazy_List$andThen,
			function (len) {
				return A3(shorter, len, listOfTrees, false);
			},
			(_elm_lang$core$Native_Utils.cmp(n, 6) > 0) ? A2(
				_elm_community$lazy_list$Lazy_List$takeWhile,
				function (x) {
					return _elm_lang$core$Native_Utils.cmp(x, 0) > 0;
				},
				A2(
					_elm_community$lazy_list$Lazy_List$iterate,
					function (n) {
						return (n / 2) | 0;
					},
					n)) : _elm_community$lazy_list$Lazy_List$fromList(
				A2(_elm_lang$core$List$range, 1, n))));
	return A2(
		_elm_community$elm_test$RoseTree$Rose,
		root,
		A2(
			_elm_community$lazy_list$Lazy_List$cons,
			_elm_community$elm_test$RoseTree$singleton(
				{ctor: '[]'}),
			A2(_elm_community$lazy_list$Lazy_List$append, shortened, shrunkenVals)));
};
var _elm_community$elm_test$Fuzz$list = function (_p61) {
	var _p62 = _p61;
	var genLength = _mgold$elm_random_pcg$Random_Pcg$frequency(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 1,
				_1: _mgold$elm_random_pcg$Random_Pcg$constant(0)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 1,
					_1: _mgold$elm_random_pcg$Random_Pcg$constant(1)
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 3,
						_1: A2(_mgold$elm_random_pcg$Random_Pcg$int, 2, 10)
					},
					_1: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: 2,
							_1: A2(_mgold$elm_random_pcg$Random_Pcg$int, 10, 100)
						},
						_1: {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: 0.5,
								_1: A2(_mgold$elm_random_pcg$Random_Pcg$int, 100, 400)
							},
							_1: {ctor: '[]'}
						}
					}
				}
			}
		});
	return _elm_community$elm_test$Fuzz_Internal$Fuzzer(
		function (noShrink) {
			var _p63 = _p62._0(noShrink);
			if (_p63.ctor === 'Gen') {
				return _elm_community$elm_test$Fuzz_Internal$Gen(
					A2(
						_mgold$elm_random_pcg$Random_Pcg$andThen,
						function (i) {
							return A2(_mgold$elm_random_pcg$Random_Pcg$list, i, _p63._0);
						},
						genLength));
			} else {
				return _elm_community$elm_test$Fuzz_Internal$Shrink(
					A2(
						_mgold$elm_random_pcg$Random_Pcg$map,
						_elm_community$elm_test$Fuzz$listShrinkHelp,
						A2(
							_mgold$elm_random_pcg$Random_Pcg$andThen,
							function (i) {
								return A2(_mgold$elm_random_pcg$Random_Pcg$list, i, _p63._0);
							},
							genLength)));
			}
		});
};
var _elm_community$elm_test$Fuzz$array = function (fuzzer) {
	return A2(
		_elm_community$elm_test$Fuzz$map,
		_elm_lang$core$Array$fromList,
		_elm_community$elm_test$Fuzz$list(fuzzer));
};
var _elm_community$elm_test$Fuzz$result = F2(
	function (_p65, _p64) {
		var _p66 = _p65;
		var _p67 = _p64;
		return _elm_community$elm_test$Fuzz_Internal$Fuzzer(
			function (noShrink) {
				var _p68 = {
					ctor: '_Tuple2',
					_0: _p66._0(noShrink),
					_1: _p67._0(noShrink)
				};
				_v36_2:
				do {
					if (_p68.ctor === '_Tuple2') {
						if (_p68._0.ctor === 'Gen') {
							if (_p68._1.ctor === 'Gen') {
								return _elm_community$elm_test$Fuzz_Internal$Gen(
									A4(
										_mgold$elm_random_pcg$Random_Pcg$map3,
										F3(
											function (useError, err, val) {
												return useError ? _elm_lang$core$Result$Err(err) : _elm_lang$core$Result$Ok(val);
											}),
										_mgold$elm_random_pcg$Random_Pcg$oneIn(4),
										_p68._0._0,
										_p68._1._0));
							} else {
								break _v36_2;
							}
						} else {
							if (_p68._1.ctor === 'Shrink') {
								return _elm_community$elm_test$Fuzz_Internal$Shrink(
									A4(
										_mgold$elm_random_pcg$Random_Pcg$map3,
										F3(
											function (useError, errorTree, valueTree) {
												return useError ? A2(_elm_community$elm_test$RoseTree$map, _elm_lang$core$Result$Err, errorTree) : A2(_elm_community$elm_test$RoseTree$map, _elm_lang$core$Result$Ok, valueTree);
											}),
										_mgold$elm_random_pcg$Random_Pcg$oneIn(4),
										_p68._0._0,
										_p68._1._0));
							} else {
								break _v36_2;
							}
						}
					} else {
						break _v36_2;
					}
				} while(false);
				return A2(
					_elm_lang$core$Native_Utils.crash(
						'Fuzz',
						{
							start: {line: 335, column: 21},
							end: {line: 335, column: 32}
						}),
					'This shouldn\'t happen: Fuzz.result',
					_p68);
			});
	});
var _elm_community$elm_test$Fuzz$maybe = function (_p69) {
	var _p70 = _p69;
	return _elm_community$elm_test$Fuzz_Internal$Fuzzer(
		function (noShrink) {
			var _p71 = _p70._0(noShrink);
			if (_p71.ctor === 'Gen') {
				return _elm_community$elm_test$Fuzz_Internal$Gen(
					A3(
						_mgold$elm_random_pcg$Random_Pcg$map2,
						F2(
							function (useNothing, val) {
								return useNothing ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(val);
							}),
						_mgold$elm_random_pcg$Random_Pcg$oneIn(4),
						_p71._0));
			} else {
				return _elm_community$elm_test$Fuzz_Internal$Shrink(
					A3(
						_mgold$elm_random_pcg$Random_Pcg$map2,
						F2(
							function (useNothing, tree) {
								return useNothing ? _elm_community$elm_test$RoseTree$singleton(_elm_lang$core$Maybe$Nothing) : A2(
									_elm_community$elm_test$RoseTree$addChild,
									_elm_community$elm_test$RoseTree$singleton(_elm_lang$core$Maybe$Nothing),
									A2(_elm_community$elm_test$RoseTree$map, _elm_lang$core$Maybe$Just, tree));
							}),
						_mgold$elm_random_pcg$Random_Pcg$oneIn(4),
						_p71._0));
			}
		});
};
var _elm_community$elm_test$Fuzz$charGenerator = A2(
	_mgold$elm_random_pcg$Random_Pcg$map,
	_elm_lang$core$Char$fromCode,
	A2(_mgold$elm_random_pcg$Random_Pcg$int, 32, 126));
var _elm_community$elm_test$Fuzz$unit = _elm_community$elm_test$Fuzz_Internal$Fuzzer(
	function (noShrink) {
		return noShrink ? _elm_community$elm_test$Fuzz_Internal$Gen(
			_mgold$elm_random_pcg$Random_Pcg$constant(
				{ctor: '_Tuple0'})) : _elm_community$elm_test$Fuzz_Internal$Shrink(
			_mgold$elm_random_pcg$Random_Pcg$constant(
				_elm_community$elm_test$RoseTree$singleton(
					{ctor: '_Tuple0'})));
	});
var _elm_community$elm_test$Fuzz$custom = F2(
	function (generator, shrinker) {
		var shrinkTree = function (a) {
			return A2(
				_elm_community$elm_test$RoseTree$Rose,
				a,
				A2(
					_elm_community$lazy_list$Lazy_List$map,
					shrinkTree,
					shrinker(a)));
		};
		return _elm_community$elm_test$Fuzz_Internal$Fuzzer(
			function (noShrink) {
				return noShrink ? _elm_community$elm_test$Fuzz_Internal$Gen(generator) : _elm_community$elm_test$Fuzz_Internal$Shrink(
					A2(_mgold$elm_random_pcg$Random_Pcg$map, shrinkTree, generator));
			});
	});
var _elm_community$elm_test$Fuzz$bool = A2(_elm_community$elm_test$Fuzz$custom, _mgold$elm_random_pcg$Random_Pcg$bool, _elm_community$shrink$Shrink$bool);
var _elm_community$elm_test$Fuzz$order = function () {
	var intToOrder = function (i) {
		return _elm_lang$core$Native_Utils.eq(i, 0) ? _elm_lang$core$Basics$LT : (_elm_lang$core$Native_Utils.eq(i, 1) ? _elm_lang$core$Basics$EQ : _elm_lang$core$Basics$GT);
	};
	return A2(
		_elm_community$elm_test$Fuzz$custom,
		A2(
			_mgold$elm_random_pcg$Random_Pcg$map,
			intToOrder,
			A2(_mgold$elm_random_pcg$Random_Pcg$int, 0, 2)),
		_elm_community$shrink$Shrink$order);
}();
var _elm_community$elm_test$Fuzz$int = function () {
	var generator = _mgold$elm_random_pcg$Random_Pcg$frequency(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 3,
				_1: A2(_mgold$elm_random_pcg$Random_Pcg$int, -50, 50)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 0.2,
					_1: _mgold$elm_random_pcg$Random_Pcg$constant(0)
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 1,
						_1: A2(_mgold$elm_random_pcg$Random_Pcg$int, 0, _mgold$elm_random_pcg$Random_Pcg$maxInt - _mgold$elm_random_pcg$Random_Pcg$minInt)
					},
					_1: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: 1,
							_1: A2(_mgold$elm_random_pcg$Random_Pcg$int, _mgold$elm_random_pcg$Random_Pcg$minInt - _mgold$elm_random_pcg$Random_Pcg$maxInt, 0)
						},
						_1: {ctor: '[]'}
					}
				}
			}
		});
	return A2(_elm_community$elm_test$Fuzz$custom, generator, _elm_community$shrink$Shrink$int);
}();
var _elm_community$elm_test$Fuzz$intRange = F2(
	function (lo, hi) {
		return A2(
			_elm_community$elm_test$Fuzz$custom,
			_mgold$elm_random_pcg$Random_Pcg$frequency(
				{
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 8,
						_1: A2(_mgold$elm_random_pcg$Random_Pcg$int, lo, hi)
					},
					_1: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: 1,
							_1: _mgold$elm_random_pcg$Random_Pcg$constant(lo)
						},
						_1: {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: 1,
								_1: _mgold$elm_random_pcg$Random_Pcg$constant(hi)
							},
							_1: {ctor: '[]'}
						}
					}
				}),
			A2(
				_elm_community$shrink$Shrink$keepIf,
				function (i) {
					return (_elm_lang$core$Native_Utils.cmp(i, lo) > -1) && (_elm_lang$core$Native_Utils.cmp(i, hi) < 1);
				},
				_elm_community$shrink$Shrink$int));
	});
var _elm_community$elm_test$Fuzz$float = function () {
	var generator = _mgold$elm_random_pcg$Random_Pcg$frequency(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 3,
				_1: A2(_mgold$elm_random_pcg$Random_Pcg$float, -50, 50)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 0.5,
					_1: _mgold$elm_random_pcg$Random_Pcg$constant(0)
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 1,
						_1: A2(_mgold$elm_random_pcg$Random_Pcg$float, -1, 1)
					},
					_1: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: 1,
							_1: A2(
								_mgold$elm_random_pcg$Random_Pcg$float,
								0,
								_elm_lang$core$Basics$toFloat(_mgold$elm_random_pcg$Random_Pcg$maxInt - _mgold$elm_random_pcg$Random_Pcg$minInt))
						},
						_1: {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: 1,
								_1: A2(
									_mgold$elm_random_pcg$Random_Pcg$float,
									_elm_lang$core$Basics$toFloat(_mgold$elm_random_pcg$Random_Pcg$minInt - _mgold$elm_random_pcg$Random_Pcg$maxInt),
									0)
							},
							_1: {ctor: '[]'}
						}
					}
				}
			}
		});
	return A2(_elm_community$elm_test$Fuzz$custom, generator, _elm_community$shrink$Shrink$float);
}();
var _elm_community$elm_test$Fuzz$floatRange = F2(
	function (lo, hi) {
		return A2(
			_elm_community$elm_test$Fuzz$custom,
			_mgold$elm_random_pcg$Random_Pcg$frequency(
				{
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 8,
						_1: A2(_mgold$elm_random_pcg$Random_Pcg$float, lo, hi)
					},
					_1: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: 1,
							_1: _mgold$elm_random_pcg$Random_Pcg$constant(lo)
						},
						_1: {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: 1,
								_1: _mgold$elm_random_pcg$Random_Pcg$constant(hi)
							},
							_1: {ctor: '[]'}
						}
					}
				}),
			A2(
				_elm_community$shrink$Shrink$keepIf,
				function (i) {
					return (_elm_lang$core$Native_Utils.cmp(i, lo) > -1) && (_elm_lang$core$Native_Utils.cmp(i, hi) < 1);
				},
				_elm_community$shrink$Shrink$float));
	});
var _elm_community$elm_test$Fuzz$percentage = function () {
	var generator = _mgold$elm_random_pcg$Random_Pcg$frequency(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 8,
				_1: A2(_mgold$elm_random_pcg$Random_Pcg$float, 0, 1)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 1,
					_1: _mgold$elm_random_pcg$Random_Pcg$constant(0)
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 1,
						_1: _mgold$elm_random_pcg$Random_Pcg$constant(1)
					},
					_1: {ctor: '[]'}
				}
			}
		});
	return A2(_elm_community$elm_test$Fuzz$custom, generator, _elm_community$shrink$Shrink$float);
}();
var _elm_community$elm_test$Fuzz$char = A2(_elm_community$elm_test$Fuzz$custom, _elm_community$elm_test$Fuzz$charGenerator, _elm_community$shrink$Shrink$character);
var _elm_community$elm_test$Fuzz$string = function () {
	var generator = A2(
		_mgold$elm_random_pcg$Random_Pcg$andThen,
		_elm_community$elm_test$Util$lengthString(_elm_community$elm_test$Fuzz$charGenerator),
		_mgold$elm_random_pcg$Random_Pcg$frequency(
			{
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 3,
					_1: A2(_mgold$elm_random_pcg$Random_Pcg$int, 1, 10)
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 0.2,
						_1: _mgold$elm_random_pcg$Random_Pcg$constant(0)
					},
					_1: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: 1,
							_1: A2(_mgold$elm_random_pcg$Random_Pcg$int, 11, 50)
						},
						_1: {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: 1,
								_1: A2(_mgold$elm_random_pcg$Random_Pcg$int, 50, 1000)
							},
							_1: {ctor: '[]'}
						}
					}
				}
			}));
	return A2(_elm_community$elm_test$Fuzz$custom, generator, _elm_community$shrink$Shrink$string);
}();

var _elm_community$elm_test$Test_Internal$isFail = F2(
	function (x, y) {
		return !_elm_lang$core$Native_Utils.eq(x, y);
	})(_elm_community$elm_test$Test_Expectation$Pass);
var _elm_community$elm_test$Test_Internal$formatExpectation = function (_p0) {
	var _p1 = _p0;
	return A2(_elm_community$elm_test$Test_Expectation$withGiven, _p1._0, _p1._1);
};
var _elm_community$elm_test$Test_Internal$shrinkAndAdd = F4(
	function (rootTree, getExpectation, rootsExpectation, dict) {
		var shrink = F2(
			function (oldExpectation, _p2) {
				shrink:
				while (true) {
					var _p3 = _p2;
					var _p6 = _p3._0;
					var _p4 = _elm_community$lazy_list$Lazy_List$headAndTail(_p3._1);
					if (_p4.ctor === 'Just') {
						var _p5 = getExpectation(_p4._0._0._0);
						if (_p5.ctor === 'Pass') {
							var _v4 = oldExpectation,
								_v5 = A2(_elm_community$elm_test$RoseTree$Rose, _p6, _p4._0._1);
							oldExpectation = _v4;
							_p2 = _v5;
							continue shrink;
						} else {
							var _v6 = _p5,
								_v7 = _p4._0._0;
							oldExpectation = _v6;
							_p2 = _v7;
							continue shrink;
						}
					} else {
						return {ctor: '_Tuple2', _0: _p6, _1: oldExpectation};
					}
				}
			});
		var _p7 = A2(shrink, rootsExpectation, rootTree);
		var result = _p7._0;
		var finalExpectation = _p7._1;
		return A3(
			_elm_lang$core$Dict$insert,
			_elm_lang$core$Basics$toString(result),
			finalExpectation,
			dict);
	});
var _elm_community$elm_test$Test_Internal$Batch = function (a) {
	return {ctor: 'Batch', _0: a};
};
var _elm_community$elm_test$Test_Internal$Labeled = F2(
	function (a, b) {
		return {ctor: 'Labeled', _0: a, _1: b};
	});
var _elm_community$elm_test$Test_Internal$filterHelp = F3(
	function (lastCheckPassed, isKeepable, test) {
		var _p8 = test;
		switch (_p8.ctor) {
			case 'Test':
				return lastCheckPassed ? test : _elm_community$elm_test$Test_Internal$Batch(
					{ctor: '[]'});
			case 'Labeled':
				var _p9 = _p8._0;
				return A2(
					_elm_community$elm_test$Test_Internal$Labeled,
					_p9,
					A3(
						_elm_community$elm_test$Test_Internal$filterHelp,
						isKeepable(_p9),
						isKeepable,
						_p8._1));
			default:
				return _elm_community$elm_test$Test_Internal$Batch(
					A2(
						_elm_lang$core$List$map,
						A2(_elm_community$elm_test$Test_Internal$filterHelp, lastCheckPassed, isKeepable),
						_p8._0));
		}
	});
var _elm_community$elm_test$Test_Internal$filter = _elm_community$elm_test$Test_Internal$filterHelp(false);
var _elm_community$elm_test$Test_Internal$Test = function (a) {
	return {ctor: 'Test', _0: a};
};
var _elm_community$elm_test$Test_Internal$fuzzTest = F3(
	function (fuzzer, desc, getExpectation) {
		var getFailures = F3(
			function (failures, currentSeed, remainingRuns) {
				getFailures:
				while (true) {
					var genVal = _elm_community$elm_test$Fuzz_Internal$unpackGenVal(fuzzer);
					var _p10 = A2(_mgold$elm_random_pcg$Random_Pcg$step, genVal, currentSeed);
					var value = _p10._0;
					var nextSeed = _p10._1;
					var newFailures = function () {
						var _p11 = getExpectation(value);
						if (_p11.ctor === 'Pass') {
							return failures;
						} else {
							var genTree = _elm_community$elm_test$Fuzz_Internal$unpackGenTree(fuzzer);
							var _p12 = A2(_mgold$elm_random_pcg$Random_Pcg$step, genTree, currentSeed);
							var rosetree = _p12._0;
							var nextSeedAgain = _p12._1;
							return A4(_elm_community$elm_test$Test_Internal$shrinkAndAdd, rosetree, getExpectation, _p11, failures);
						}
					}();
					if (_elm_lang$core$Native_Utils.eq(remainingRuns, 1)) {
						return newFailures;
					} else {
						var _v10 = newFailures,
							_v11 = nextSeed,
							_v12 = remainingRuns - 1;
						failures = _v10;
						currentSeed = _v11;
						remainingRuns = _v12;
						continue getFailures;
					}
				}
			});
		var run = F2(
			function (seed, runs) {
				var failures = A3(getFailures, _elm_lang$core$Dict$empty, seed, runs);
				return _elm_lang$core$Dict$isEmpty(failures) ? {
					ctor: '::',
					_0: _elm_community$elm_test$Test_Expectation$Pass,
					_1: {ctor: '[]'}
				} : A2(
					_elm_lang$core$List$map,
					_elm_community$elm_test$Test_Internal$formatExpectation,
					_elm_lang$core$Dict$toList(failures));
			});
		return A2(
			_elm_community$elm_test$Test_Internal$Labeled,
			desc,
			_elm_community$elm_test$Test_Internal$Test(run));
	});

var _elm_lang$core$Set$foldr = F3(
	function (f, b, _p0) {
		var _p1 = _p0;
		return A3(
			_elm_lang$core$Dict$foldr,
			F3(
				function (k, _p2, b) {
					return A2(f, k, b);
				}),
			b,
			_p1._0);
	});
var _elm_lang$core$Set$foldl = F3(
	function (f, b, _p3) {
		var _p4 = _p3;
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, _p5, b) {
					return A2(f, k, b);
				}),
			b,
			_p4._0);
	});
var _elm_lang$core$Set$toList = function (_p6) {
	var _p7 = _p6;
	return _elm_lang$core$Dict$keys(_p7._0);
};
var _elm_lang$core$Set$size = function (_p8) {
	var _p9 = _p8;
	return _elm_lang$core$Dict$size(_p9._0);
};
var _elm_lang$core$Set$member = F2(
	function (k, _p10) {
		var _p11 = _p10;
		return A2(_elm_lang$core$Dict$member, k, _p11._0);
	});
var _elm_lang$core$Set$isEmpty = function (_p12) {
	var _p13 = _p12;
	return _elm_lang$core$Dict$isEmpty(_p13._0);
};
var _elm_lang$core$Set$Set_elm_builtin = function (a) {
	return {ctor: 'Set_elm_builtin', _0: a};
};
var _elm_lang$core$Set$empty = _elm_lang$core$Set$Set_elm_builtin(_elm_lang$core$Dict$empty);
var _elm_lang$core$Set$singleton = function (k) {
	return _elm_lang$core$Set$Set_elm_builtin(
		A2(
			_elm_lang$core$Dict$singleton,
			k,
			{ctor: '_Tuple0'}));
};
var _elm_lang$core$Set$insert = F2(
	function (k, _p14) {
		var _p15 = _p14;
		return _elm_lang$core$Set$Set_elm_builtin(
			A3(
				_elm_lang$core$Dict$insert,
				k,
				{ctor: '_Tuple0'},
				_p15._0));
	});
var _elm_lang$core$Set$fromList = function (xs) {
	return A3(_elm_lang$core$List$foldl, _elm_lang$core$Set$insert, _elm_lang$core$Set$empty, xs);
};
var _elm_lang$core$Set$map = F2(
	function (f, s) {
		return _elm_lang$core$Set$fromList(
			A2(
				_elm_lang$core$List$map,
				f,
				_elm_lang$core$Set$toList(s)));
	});
var _elm_lang$core$Set$remove = F2(
	function (k, _p16) {
		var _p17 = _p16;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$remove, k, _p17._0));
	});
var _elm_lang$core$Set$union = F2(
	function (_p19, _p18) {
		var _p20 = _p19;
		var _p21 = _p18;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$union, _p20._0, _p21._0));
	});
var _elm_lang$core$Set$intersect = F2(
	function (_p23, _p22) {
		var _p24 = _p23;
		var _p25 = _p22;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$intersect, _p24._0, _p25._0));
	});
var _elm_lang$core$Set$diff = F2(
	function (_p27, _p26) {
		var _p28 = _p27;
		var _p29 = _p26;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$diff, _p28._0, _p29._0));
	});
var _elm_lang$core$Set$filter = F2(
	function (p, _p30) {
		var _p31 = _p30;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(
				_elm_lang$core$Dict$filter,
				F2(
					function (k, _p32) {
						return p(k);
					}),
				_p31._0));
	});
var _elm_lang$core$Set$partition = F2(
	function (p, _p33) {
		var _p34 = _p33;
		var _p35 = A2(
			_elm_lang$core$Dict$partition,
			F2(
				function (k, _p36) {
					return p(k);
				}),
			_p34._0);
		var p1 = _p35._0;
		var p2 = _p35._1;
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Set$Set_elm_builtin(p1),
			_1: _elm_lang$core$Set$Set_elm_builtin(p2)
		};
	});

var _elm_community$elm_test$Expect$formatDiffs = F2(
	function (diffType, diffs) {
		if (_elm_lang$core$List$isEmpty(diffs)) {
			return '';
		} else {
			var modifier = function () {
				var _p0 = diffType;
				if (_p0.ctor === 'Extra') {
					return '+';
				} else {
					return '-';
				}
			}();
			return function (d) {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					' ',
					A2(
						_elm_lang$core$Basics_ops['++'],
						modifier,
						A2(
							_elm_lang$core$Basics_ops['++'],
							'[ ',
							A2(_elm_lang$core$Basics_ops['++'], d, ' ]'))));
			}(
				A2(
					_elm_lang$core$String$join,
					', ',
					A2(_elm_lang$core$List$map, _elm_lang$core$Basics$toString, diffs)));
		}
	});
var _elm_community$elm_test$Expect$reportFailure = F3(
	function (comparison, expected, actual) {
		return A2(
			_elm_lang$core$String$join,
			'\n',
			{
				ctor: '::',
				_0: actual,
				_1: {
					ctor: '::',
					_0: '╷',
					_1: {
						ctor: '::',
						_0: A2(_elm_lang$core$Basics_ops['++'], '│ ', comparison),
						_1: {
							ctor: '::',
							_0: '╵',
							_1: {
								ctor: '::',
								_0: expected,
								_1: {ctor: '[]'}
							}
						}
					}
				}
			});
	});
var _elm_community$elm_test$Expect$onFail = F2(
	function (str, expectation) {
		var _p1 = expectation;
		if (_p1.ctor === 'Pass') {
			return expectation;
		} else {
			return A2(_elm_community$elm_test$Test_Expectation$Fail, _p1._0, str);
		}
	});
var _elm_community$elm_test$Expect$getFailure = function (expectation) {
	var _p2 = expectation;
	if (_p2.ctor === 'Pass') {
		return _elm_lang$core$Maybe$Nothing;
	} else {
		return _elm_lang$core$Maybe$Just(
			{given: _p2._0, message: _p2._1});
	}
};
var _elm_community$elm_test$Expect$fail = _elm_community$elm_test$Test_Expectation$Fail('');
var _elm_community$elm_test$Expect$pass = _elm_community$elm_test$Test_Expectation$Pass;
var _elm_community$elm_test$Expect$compareWith = F4(
	function (label, compare, expected, actual) {
		return A2(compare, actual, expected) ? _elm_community$elm_test$Expect$pass : _elm_community$elm_test$Expect$fail(
			A3(
				_elm_community$elm_test$Expect$reportFailure,
				label,
				_elm_lang$core$Basics$toString(expected),
				_elm_lang$core$Basics$toString(actual)));
	});
var _elm_community$elm_test$Expect$allHelp = F2(
	function (list, query) {
		allHelp:
		while (true) {
			var _p3 = list;
			if (_p3.ctor === '[]') {
				return _elm_community$elm_test$Expect$pass;
			} else {
				var _p4 = _p3._0(query);
				if (_p4.ctor === 'Pass') {
					var _v5 = _p3._1,
						_v6 = query;
					list = _v5;
					query = _v6;
					continue allHelp;
				} else {
					return _p4;
				}
			}
		}
	});
var _elm_community$elm_test$Expect$all = F2(
	function (list, query) {
		return _elm_lang$core$List$isEmpty(list) ? _elm_community$elm_test$Expect$fail('Expect.all received an empty list. I assume this was due to a mistake somewhere, so I\'m failing this test!') : A2(_elm_community$elm_test$Expect$allHelp, list, query);
	});
var _elm_community$elm_test$Expect$equalLists = F2(
	function (expected, actual) {
		if (_elm_lang$core$Native_Utils.eq(expected, actual)) {
			return _elm_community$elm_test$Expect$pass;
		} else {
			var result = A2(
				_elm_lang$core$Maybe$map,
				function (_p5) {
					var _p6 = _p5;
					var _p9 = _p6._0;
					var _p8 = _p6._2;
					var _p7 = _p6._1;
					return _elm_community$elm_test$Expect$fail(
						A2(
							_elm_lang$core$String$join,
							'\n',
							{
								ctor: '::',
								_0: _elm_lang$core$Basics$toString(actual),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$core$Basics_ops['++'],
										'first diff at index index ',
										A2(
											_elm_lang$core$Basics_ops['++'],
											_elm_lang$core$Basics$toString(_p9),
											A2(
												_elm_lang$core$Basics_ops['++'],
												': +`',
												A2(
													_elm_lang$core$Basics_ops['++'],
													_elm_lang$core$Basics$toString(_p7),
													A2(
														_elm_lang$core$Basics_ops['++'],
														'`, -`',
														A2(
															_elm_lang$core$Basics_ops['++'],
															_elm_lang$core$Basics$toString(_p8),
															'`')))))),
									_1: {
										ctor: '::',
										_0: '╷',
										_1: {
											ctor: '::',
											_0: '│ Expect.equalLists',
											_1: {
												ctor: '::',
												_0: '╵',
												_1: {
													ctor: '::',
													_0: A2(
														_elm_lang$core$Basics_ops['++'],
														'first diff at index index ',
														A2(
															_elm_lang$core$Basics_ops['++'],
															_elm_lang$core$Basics$toString(_p9),
															A2(
																_elm_lang$core$Basics_ops['++'],
																': +`',
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	_elm_lang$core$Basics$toString(_p8),
																	A2(
																		_elm_lang$core$Basics_ops['++'],
																		'`, -`',
																		A2(
																			_elm_lang$core$Basics_ops['++'],
																			_elm_lang$core$Basics$toString(_p7),
																			'`')))))),
													_1: {
														ctor: '::',
														_0: _elm_lang$core$Basics$toString(expected),
														_1: {ctor: '[]'}
													}
												}
											}
										}
									}
								}
							}));
				},
				_elm_lang$core$List$head(
					A2(
						_elm_lang$core$List$filterMap,
						function (_p10) {
							var _p11 = _p10;
							var _p13 = _p11._1._1;
							var _p12 = _p11._1._0;
							return _elm_lang$core$Native_Utils.eq(_p13, _p12) ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(
								{ctor: '_Tuple3', _0: _p11._0, _1: _p12, _2: _p13});
						},
						A2(
							_elm_lang$core$List$indexedMap,
							F2(
								function (v0, v1) {
									return {ctor: '_Tuple2', _0: v0, _1: v1};
								}),
							A3(
								_elm_lang$core$List$map2,
								F2(
									function (v0, v1) {
										return {ctor: '_Tuple2', _0: v0, _1: v1};
									}),
								actual,
								expected)))));
			var _p14 = result;
			if (_p14.ctor === 'Just') {
				return _p14._0;
			} else {
				var _p15 = A2(
					_elm_lang$core$Basics$compare,
					_elm_lang$core$List$length(actual),
					_elm_lang$core$List$length(expected));
				switch (_p15.ctor) {
					case 'GT':
						return _elm_community$elm_test$Expect$fail(
							A3(
								_elm_community$elm_test$Expect$reportFailure,
								'Expect.equalLists was longer than',
								_elm_lang$core$Basics$toString(expected),
								_elm_lang$core$Basics$toString(actual)));
					case 'LT':
						return _elm_community$elm_test$Expect$fail(
							A3(
								_elm_community$elm_test$Expect$reportFailure,
								'Expect.equalLists was shorter than',
								_elm_lang$core$Basics$toString(expected),
								_elm_lang$core$Basics$toString(actual)));
					default:
						return _elm_community$elm_test$Expect$pass;
				}
			}
		}
	});
var _elm_community$elm_test$Expect$false = F2(
	function (message, bool) {
		return bool ? _elm_community$elm_test$Expect$fail(message) : _elm_community$elm_test$Expect$pass;
	});
var _elm_community$elm_test$Expect$true = F2(
	function (message, bool) {
		return bool ? _elm_community$elm_test$Expect$pass : _elm_community$elm_test$Expect$fail(message);
	});
var _elm_community$elm_test$Expect$atLeast = A2(
	_elm_community$elm_test$Expect$compareWith,
	'Expect.atLeast',
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.cmp(x, y) > -1;
		}));
var _elm_community$elm_test$Expect$greaterThan = A2(
	_elm_community$elm_test$Expect$compareWith,
	'Expect.greaterThan',
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.cmp(x, y) > 0;
		}));
var _elm_community$elm_test$Expect$atMost = A2(
	_elm_community$elm_test$Expect$compareWith,
	'Expect.atMost',
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.cmp(x, y) < 1;
		}));
var _elm_community$elm_test$Expect$lessThan = A2(
	_elm_community$elm_test$Expect$compareWith,
	'Expect.lessThan',
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.cmp(x, y) < 0;
		}));
var _elm_community$elm_test$Expect$notEqual = A2(
	_elm_community$elm_test$Expect$compareWith,
	'Expect.notEqual',
	F2(
		function (x, y) {
			return !_elm_lang$core$Native_Utils.eq(x, y);
		}));
var _elm_community$elm_test$Expect$equal = A2(
	_elm_community$elm_test$Expect$compareWith,
	'Expect.equal',
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.eq(x, y);
		}));
var _elm_community$elm_test$Expect$Missing = {ctor: 'Missing'};
var _elm_community$elm_test$Expect$Extra = {ctor: 'Extra'};
var _elm_community$elm_test$Expect$reportCollectionFailure = F5(
	function (comparison, expected, actual, missingKeys, extraKeys) {
		return A2(
			_elm_lang$core$String$join,
			'\n',
			{
				ctor: '::',
				_0: _elm_lang$core$Basics$toString(actual),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$core$Basics_ops['++'],
						'diff:',
						A2(
							_elm_lang$core$Basics_ops['++'],
							A2(_elm_community$elm_test$Expect$formatDiffs, _elm_community$elm_test$Expect$Missing, missingKeys),
							A2(_elm_community$elm_test$Expect$formatDiffs, _elm_community$elm_test$Expect$Extra, extraKeys))),
					_1: {
						ctor: '::',
						_0: '╷',
						_1: {
							ctor: '::',
							_0: A2(_elm_lang$core$Basics_ops['++'], '│ ', comparison),
							_1: {
								ctor: '::',
								_0: '╵',
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$core$Basics_ops['++'],
										'diff:',
										A2(
											_elm_lang$core$Basics_ops['++'],
											A2(_elm_community$elm_test$Expect$formatDiffs, _elm_community$elm_test$Expect$Extra, missingKeys),
											A2(_elm_community$elm_test$Expect$formatDiffs, _elm_community$elm_test$Expect$Missing, extraKeys))),
									_1: {
										ctor: '::',
										_0: _elm_lang$core$Basics$toString(expected),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}
			});
	});
var _elm_community$elm_test$Expect$equalDicts = F2(
	function (expected, actual) {
		if (_elm_lang$core$Native_Utils.eq(
			_elm_lang$core$Dict$toList(expected),
			_elm_lang$core$Dict$toList(actual))) {
			return _elm_community$elm_test$Expect$pass;
		} else {
			var differ = F4(
				function (dict, k, v, diffs) {
					return _elm_lang$core$Native_Utils.eq(
						A2(_elm_lang$core$Dict$get, k, dict),
						_elm_lang$core$Maybe$Just(v)) ? diffs : {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: k, _1: v},
						_1: diffs
					};
				});
			var missingKeys = A3(
				_elm_lang$core$Dict$foldr,
				differ(actual),
				{ctor: '[]'},
				expected);
			var extraKeys = A3(
				_elm_lang$core$Dict$foldr,
				differ(expected),
				{ctor: '[]'},
				actual);
			return _elm_community$elm_test$Expect$fail(
				A5(_elm_community$elm_test$Expect$reportCollectionFailure, 'Expect.equalDicts', expected, actual, missingKeys, extraKeys));
		}
	});
var _elm_community$elm_test$Expect$equalSets = F2(
	function (expected, actual) {
		if (_elm_lang$core$Native_Utils.eq(
			_elm_lang$core$Set$toList(expected),
			_elm_lang$core$Set$toList(actual))) {
			return _elm_community$elm_test$Expect$pass;
		} else {
			var extraKeys = _elm_lang$core$Set$toList(
				A2(_elm_lang$core$Set$diff, actual, expected));
			var missingKeys = _elm_lang$core$Set$toList(
				A2(_elm_lang$core$Set$diff, expected, actual));
			return _elm_community$elm_test$Expect$fail(
				A5(_elm_community$elm_test$Expect$reportCollectionFailure, 'Expect.equalSets', expected, actual, missingKeys, extraKeys));
		}
	});

var _elm_community$elm_test$Test$uncurry5 = F2(
	function (fn, _p0) {
		var _p1 = _p0;
		return A5(fn, _p1._0, _p1._1, _p1._2, _p1._3, _p1._4);
	});
var _elm_community$elm_test$Test$uncurry4 = F2(
	function (fn, _p2) {
		var _p3 = _p2;
		return A4(fn, _p3._0, _p3._1, _p3._2, _p3._3);
	});
var _elm_community$elm_test$Test$uncurry3 = F2(
	function (fn, _p4) {
		var _p5 = _p4;
		return A3(fn, _p5._0, _p5._1, _p5._2);
	});
var _elm_community$elm_test$Test$fuzz = _elm_community$elm_test$Test_Internal$fuzzTest;
var _elm_community$elm_test$Test$fuzz2 = F3(
	function (fuzzA, fuzzB, desc) {
		var fuzzer = _elm_community$elm_test$Fuzz$tuple(
			{ctor: '_Tuple2', _0: fuzzA, _1: fuzzB});
		return function (_p6) {
			return A3(
				_elm_community$elm_test$Test$fuzz,
				fuzzer,
				desc,
				_elm_lang$core$Basics$uncurry(_p6));
		};
	});
var _elm_community$elm_test$Test$fuzz3 = F4(
	function (fuzzA, fuzzB, fuzzC, desc) {
		var fuzzer = _elm_community$elm_test$Fuzz$tuple3(
			{ctor: '_Tuple3', _0: fuzzA, _1: fuzzB, _2: fuzzC});
		return function (_p7) {
			return A3(
				_elm_community$elm_test$Test$fuzz,
				fuzzer,
				desc,
				_elm_community$elm_test$Test$uncurry3(_p7));
		};
	});
var _elm_community$elm_test$Test$fuzz4 = F5(
	function (fuzzA, fuzzB, fuzzC, fuzzD, desc) {
		var fuzzer = _elm_community$elm_test$Fuzz$tuple4(
			{ctor: '_Tuple4', _0: fuzzA, _1: fuzzB, _2: fuzzC, _3: fuzzD});
		return function (_p8) {
			return A3(
				_elm_community$elm_test$Test$fuzz,
				fuzzer,
				desc,
				_elm_community$elm_test$Test$uncurry4(_p8));
		};
	});
var _elm_community$elm_test$Test$fuzz5 = F6(
	function (fuzzA, fuzzB, fuzzC, fuzzD, fuzzE, desc) {
		var fuzzer = _elm_community$elm_test$Fuzz$tuple5(
			{ctor: '_Tuple5', _0: fuzzA, _1: fuzzB, _2: fuzzC, _3: fuzzD, _4: fuzzE});
		return function (_p9) {
			return A3(
				_elm_community$elm_test$Test$fuzz,
				fuzzer,
				desc,
				_elm_community$elm_test$Test$uncurry5(_p9));
		};
	});
var _elm_community$elm_test$Test$fuzzWithHelp = F2(
	function (options, test) {
		var _p10 = test;
		switch (_p10.ctor) {
			case 'Test':
				return _elm_community$elm_test$Test_Internal$Test(
					F2(
						function (seed, _p11) {
							return A2(_p10._0, seed, options.runs);
						}));
			case 'Labeled':
				return A2(
					_elm_community$elm_test$Test_Internal$Labeled,
					_p10._0,
					A2(_elm_community$elm_test$Test$fuzzWithHelp, options, _p10._1));
			default:
				return _elm_community$elm_test$Test_Internal$Batch(
					A2(
						_elm_lang$core$List$map,
						_elm_community$elm_test$Test$fuzzWithHelp(options),
						_p10._0));
		}
	});
var _elm_community$elm_test$Test$test = F2(
	function (desc, thunk) {
		return A2(
			_elm_community$elm_test$Test_Internal$Labeled,
			desc,
			_elm_community$elm_test$Test_Internal$Test(
				F2(
					function (_p13, _p12) {
						return {
							ctor: '::',
							_0: thunk(
								{ctor: '_Tuple0'}),
							_1: {ctor: '[]'}
						};
					})));
	});
var _elm_community$elm_test$Test$fuzzWith = F4(
	function (options, fuzzer, desc, getTest) {
		return (_elm_lang$core$Native_Utils.cmp(options.runs, 1) < 0) ? A2(
			_elm_community$elm_test$Test$test,
			desc,
			function (_p14) {
				var _p15 = _p14;
				return _elm_community$elm_test$Expect$fail(
					A2(
						_elm_lang$core$Basics_ops['++'],
						'Fuzz test run count must be at least 1, not ',
						_elm_lang$core$Basics$toString(options.runs)));
			}) : A2(
			_elm_community$elm_test$Test$fuzzWithHelp,
			options,
			A3(_elm_community$elm_test$Test$fuzz, fuzzer, desc, getTest));
	});
var _elm_community$elm_test$Test$describe = function (desc) {
	return function (_p16) {
		return A2(
			_elm_community$elm_test$Test_Internal$Labeled,
			desc,
			_elm_community$elm_test$Test_Internal$Batch(_p16));
	};
};
var _elm_community$elm_test$Test$filter = _elm_community$elm_test$Test_Internal$filter;
var _elm_community$elm_test$Test$concat = _elm_community$elm_test$Test_Internal$Batch;
var _elm_community$elm_test$Test$FuzzOptions = function (a) {
	return {runs: a};
};

var _elm_community$elm_test$Test_Runner$formatLabels = F3(
	function (formatDescription, formatTest, labels) {
		var _p1 = A2(
			_elm_lang$core$List$filter,
			function (_p0) {
				return !_elm_lang$core$String$isEmpty(_p0);
			},
			labels);
		if (_p1.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			return _elm_lang$core$List$reverse(
				A2(
					F2(
						function (x, y) {
							return {ctor: '::', _0: x, _1: y};
						}),
					formatTest(_p1._0),
					A2(_elm_lang$core$List$map, formatDescription, _p1._1)));
		}
	});
var _elm_community$elm_test$Test_Runner$run = function (_p2) {
	var _p3 = _p2;
	return _p3._0(
		{ctor: '_Tuple0'});
};
var _elm_community$elm_test$Test_Runner$Thunk = function (a) {
	return {ctor: 'Thunk', _0: a};
};
var _elm_community$elm_test$Test_Runner$Batch = function (a) {
	return {ctor: 'Batch', _0: a};
};
var _elm_community$elm_test$Test_Runner$Labeled = F2(
	function (a, b) {
		return {ctor: 'Labeled', _0: a, _1: b};
	});
var _elm_community$elm_test$Test_Runner$Runnable = function (a) {
	return {ctor: 'Runnable', _0: a};
};
var _elm_community$elm_test$Test_Runner$distributeSeeds = F3(
	function (runs, test, _p4) {
		var _p5 = _p4;
		var _p13 = _p5._0;
		var _p12 = _p5._1;
		var _p6 = test;
		switch (_p6.ctor) {
			case 'Test':
				var _p7 = A2(_mgold$elm_random_pcg$Random_Pcg$step, _mgold$elm_random_pcg$Random_Pcg$independentSeed, _p13);
				var seed = _p7._0;
				var nextSeed = _p7._1;
				return {
					ctor: '_Tuple2',
					_0: nextSeed,
					_1: A2(
						_elm_lang$core$Basics_ops['++'],
						_p12,
						{
							ctor: '::',
							_0: _elm_community$elm_test$Test_Runner$Runnable(
								_elm_community$elm_test$Test_Runner$Thunk(
									function (_p8) {
										var _p9 = _p8;
										return A2(_p6._0, seed, runs);
									})),
							_1: {ctor: '[]'}
						})
				};
			case 'Labeled':
				var _p10 = A3(
					_elm_community$elm_test$Test_Runner$distributeSeeds,
					runs,
					_p6._1,
					{
						ctor: '_Tuple2',
						_0: _p13,
						_1: {ctor: '[]'}
					});
				var nextSeed = _p10._0;
				var nextRunners = _p10._1;
				var finalRunners = A2(
					_elm_lang$core$List$map,
					_elm_community$elm_test$Test_Runner$Labeled(_p6._0),
					nextRunners);
				return {
					ctor: '_Tuple2',
					_0: nextSeed,
					_1: A2(_elm_lang$core$Basics_ops['++'], _p12, finalRunners)
				};
			default:
				var _p11 = A3(
					_elm_lang$core$List$foldl,
					_elm_community$elm_test$Test_Runner$distributeSeeds(runs),
					{
						ctor: '_Tuple2',
						_0: _p13,
						_1: {ctor: '[]'}
					},
					_p6._0);
				var nextSeed = _p11._0;
				var nextRunners = _p11._1;
				return {
					ctor: '_Tuple2',
					_0: nextSeed,
					_1: {
						ctor: '::',
						_0: _elm_community$elm_test$Test_Runner$Batch(
							A2(_elm_lang$core$Basics_ops['++'], _p12, nextRunners)),
						_1: {ctor: '[]'}
					}
				};
		}
	});
var _elm_community$elm_test$Test_Runner$fromTest = F3(
	function (runs, seed, test) {
		if (_elm_lang$core$Native_Utils.cmp(runs, 1) < 0) {
			return _elm_community$elm_test$Test_Runner$Runnable(
				_elm_community$elm_test$Test_Runner$Thunk(
					function (_p14) {
						var _p15 = _p14;
						return {
							ctor: '::',
							_0: _elm_community$elm_test$Expect$fail(
								A2(
									_elm_lang$core$Basics_ops['++'],
									'Test runner run count must be at least 1, not ',
									_elm_lang$core$Basics$toString(runs))),
							_1: {ctor: '[]'}
						};
					}));
		} else {
			var _p16 = test;
			switch (_p16.ctor) {
				case 'Test':
					return _elm_community$elm_test$Test_Runner$Runnable(
						_elm_community$elm_test$Test_Runner$Thunk(
							function (_p17) {
								var _p18 = _p17;
								return A2(_p16._0, seed, runs);
							}));
				case 'Labeled':
					return A2(
						_elm_community$elm_test$Test_Runner$Labeled,
						_p16._0,
						A3(_elm_community$elm_test$Test_Runner$fromTest, runs, seed, _p16._1));
				default:
					return _elm_community$elm_test$Test_Runner$Batch(
						_elm_lang$core$Tuple$second(
							A3(
								_elm_lang$core$List$foldl,
								_elm_community$elm_test$Test_Runner$distributeSeeds(runs),
								{
									ctor: '_Tuple2',
									_0: seed,
									_1: {ctor: '[]'}
								},
								_p16._0)));
			}
		}
	});

//import Maybe, Native.List //

var _elm_lang$core$Native_Regex = function() {

function escape(str)
{
	return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
function caseInsensitive(re)
{
	return new RegExp(re.source, 'gi');
}
function regex(raw)
{
	return new RegExp(raw, 'g');
}

function contains(re, string)
{
	return string.match(re) !== null;
}

function find(n, re, str)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	var out = [];
	var number = 0;
	var string = str;
	var lastIndex = re.lastIndex;
	var prevLastIndex = -1;
	var result;
	while (number++ < n && (result = re.exec(string)))
	{
		if (prevLastIndex === re.lastIndex) break;
		var i = result.length - 1;
		var subs = new Array(i);
		while (i > 0)
		{
			var submatch = result[i];
			subs[--i] = submatch === undefined
				? _elm_lang$core$Maybe$Nothing
				: _elm_lang$core$Maybe$Just(submatch);
		}
		out.push({
			match: result[0],
			submatches: _elm_lang$core$Native_List.fromArray(subs),
			index: result.index,
			number: number
		});
		prevLastIndex = re.lastIndex;
	}
	re.lastIndex = lastIndex;
	return _elm_lang$core$Native_List.fromArray(out);
}

function replace(n, re, replacer, string)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	var count = 0;
	function jsReplacer(match)
	{
		if (count++ >= n)
		{
			return match;
		}
		var i = arguments.length - 3;
		var submatches = new Array(i);
		while (i > 0)
		{
			var submatch = arguments[i];
			submatches[--i] = submatch === undefined
				? _elm_lang$core$Maybe$Nothing
				: _elm_lang$core$Maybe$Just(submatch);
		}
		return replacer({
			match: match,
			submatches: _elm_lang$core$Native_List.fromArray(submatches),
			index: arguments[arguments.length - 2],
			number: count
		});
	}
	return string.replace(re, jsReplacer);
}

function split(n, re, str)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	if (n === Infinity)
	{
		return _elm_lang$core$Native_List.fromArray(str.split(re));
	}
	var string = str;
	var result;
	var out = [];
	var start = re.lastIndex;
	var restoreLastIndex = re.lastIndex;
	while (n--)
	{
		if (!(result = re.exec(string))) break;
		out.push(string.slice(start, result.index));
		start = re.lastIndex;
	}
	out.push(string.slice(start));
	re.lastIndex = restoreLastIndex;
	return _elm_lang$core$Native_List.fromArray(out);
}

return {
	regex: regex,
	caseInsensitive: caseInsensitive,
	escape: escape,

	contains: F2(contains),
	find: F3(find),
	replace: F4(replace),
	split: F3(split)
};

}();

var _elm_lang$core$Process$kill = _elm_lang$core$Native_Scheduler.kill;
var _elm_lang$core$Process$sleep = _elm_lang$core$Native_Scheduler.sleep;
var _elm_lang$core$Process$spawn = _elm_lang$core$Native_Scheduler.spawn;

var _elm_lang$core$Regex$split = _elm_lang$core$Native_Regex.split;
var _elm_lang$core$Regex$replace = _elm_lang$core$Native_Regex.replace;
var _elm_lang$core$Regex$find = _elm_lang$core$Native_Regex.find;
var _elm_lang$core$Regex$contains = _elm_lang$core$Native_Regex.contains;
var _elm_lang$core$Regex$caseInsensitive = _elm_lang$core$Native_Regex.caseInsensitive;
var _elm_lang$core$Regex$regex = _elm_lang$core$Native_Regex.regex;
var _elm_lang$core$Regex$escape = _elm_lang$core$Native_Regex.escape;
var _elm_lang$core$Regex$Match = F4(
	function (a, b, c, d) {
		return {match: a, submatches: b, index: c, number: d};
	});
var _elm_lang$core$Regex$Regex = {ctor: 'Regex'};
var _elm_lang$core$Regex$AtMost = function (a) {
	return {ctor: 'AtMost', _0: a};
};
var _elm_lang$core$Regex$All = {ctor: 'All'};

var _elm_lang$virtual_dom$VirtualDom_Debug$wrap;
var _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags;

var _elm_lang$virtual_dom$Native_VirtualDom = function() {

var STYLE_KEY = 'STYLE';
var EVENT_KEY = 'EVENT';
var ATTR_KEY = 'ATTR';
var ATTR_NS_KEY = 'ATTR_NS';

var localDoc = typeof document !== 'undefined' ? document : {};


////////////  VIRTUAL DOM NODES  ////////////


function text(string)
{
	return {
		type: 'text',
		text: string
	};
}


function node(tag)
{
	return F2(function(factList, kidList) {
		return nodeHelp(tag, factList, kidList);
	});
}


function nodeHelp(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function keyedNode(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid._1.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'keyed-node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function custom(factList, model, impl)
{
	var facts = organizeFacts(factList).facts;

	return {
		type: 'custom',
		facts: facts,
		model: model,
		impl: impl
	};
}


function map(tagger, node)
{
	return {
		type: 'tagger',
		tagger: tagger,
		node: node,
		descendantsCount: 1 + (node.descendantsCount || 0)
	};
}


function thunk(func, args, thunk)
{
	return {
		type: 'thunk',
		func: func,
		args: args,
		thunk: thunk,
		node: undefined
	};
}

function lazy(fn, a)
{
	return thunk(fn, [a], function() {
		return fn(a);
	});
}

function lazy2(fn, a, b)
{
	return thunk(fn, [a,b], function() {
		return A2(fn, a, b);
	});
}

function lazy3(fn, a, b, c)
{
	return thunk(fn, [a,b,c], function() {
		return A3(fn, a, b, c);
	});
}



// FACTS


function organizeFacts(factList)
{
	var namespace, facts = {};

	while (factList.ctor !== '[]')
	{
		var entry = factList._0;
		var key = entry.key;

		if (key === ATTR_KEY || key === ATTR_NS_KEY || key === EVENT_KEY)
		{
			var subFacts = facts[key] || {};
			subFacts[entry.realKey] = entry.value;
			facts[key] = subFacts;
		}
		else if (key === STYLE_KEY)
		{
			var styles = facts[key] || {};
			var styleList = entry.value;
			while (styleList.ctor !== '[]')
			{
				var style = styleList._0;
				styles[style._0] = style._1;
				styleList = styleList._1;
			}
			facts[key] = styles;
		}
		else if (key === 'namespace')
		{
			namespace = entry.value;
		}
		else if (key === 'className')
		{
			var classes = facts[key];
			facts[key] = typeof classes === 'undefined'
				? entry.value
				: classes + ' ' + entry.value;
		}
 		else
		{
			facts[key] = entry.value;
		}
		factList = factList._1;
	}

	return {
		facts: facts,
		namespace: namespace
	};
}



////////////  PROPERTIES AND ATTRIBUTES  ////////////


function style(value)
{
	return {
		key: STYLE_KEY,
		value: value
	};
}


function property(key, value)
{
	return {
		key: key,
		value: value
	};
}


function attribute(key, value)
{
	return {
		key: ATTR_KEY,
		realKey: key,
		value: value
	};
}


function attributeNS(namespace, key, value)
{
	return {
		key: ATTR_NS_KEY,
		realKey: key,
		value: {
			value: value,
			namespace: namespace
		}
	};
}


function on(name, options, decoder)
{
	return {
		key: EVENT_KEY,
		realKey: name,
		value: {
			options: options,
			decoder: decoder
		}
	};
}


function equalEvents(a, b)
{
	if (a.options !== b.options)
	{
		if (a.options.stopPropagation !== b.options.stopPropagation || a.options.preventDefault !== b.options.preventDefault)
		{
			return false;
		}
	}
	return _elm_lang$core$Native_Json.equality(a.decoder, b.decoder);
}


function mapProperty(func, property)
{
	if (property.key !== EVENT_KEY)
	{
		return property;
	}
	return on(
		property.realKey,
		property.value.options,
		A2(_elm_lang$core$Json_Decode$map, func, property.value.decoder)
	);
}


////////////  RENDER  ////////////


function render(vNode, eventNode)
{
	switch (vNode.type)
	{
		case 'thunk':
			if (!vNode.node)
			{
				vNode.node = vNode.thunk();
			}
			return render(vNode.node, eventNode);

		case 'tagger':
			var subNode = vNode.node;
			var tagger = vNode.tagger;

			while (subNode.type === 'tagger')
			{
				typeof tagger !== 'object'
					? tagger = [tagger, subNode.tagger]
					: tagger.push(subNode.tagger);

				subNode = subNode.node;
			}

			var subEventRoot = { tagger: tagger, parent: eventNode };
			var domNode = render(subNode, subEventRoot);
			domNode.elm_event_node_ref = subEventRoot;
			return domNode;

		case 'text':
			return localDoc.createTextNode(vNode.text);

		case 'node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i], eventNode));
			}

			return domNode;

		case 'keyed-node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i]._1, eventNode));
			}

			return domNode;

		case 'custom':
			var domNode = vNode.impl.render(vNode.model);
			applyFacts(domNode, eventNode, vNode.facts);
			return domNode;
	}
}



////////////  APPLY FACTS  ////////////


function applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		switch (key)
		{
			case STYLE_KEY:
				applyStyles(domNode, value);
				break;

			case EVENT_KEY:
				applyEvents(domNode, eventNode, value);
				break;

			case ATTR_KEY:
				applyAttrs(domNode, value);
				break;

			case ATTR_NS_KEY:
				applyAttrsNS(domNode, value);
				break;

			case 'value':
				if (domNode[key] !== value)
				{
					domNode[key] = value;
				}
				break;

			default:
				domNode[key] = value;
				break;
		}
	}
}

function applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}

function applyEvents(domNode, eventNode, events)
{
	var allHandlers = domNode.elm_handlers || {};

	for (var key in events)
	{
		var handler = allHandlers[key];
		var value = events[key];

		if (typeof value === 'undefined')
		{
			domNode.removeEventListener(key, handler);
			allHandlers[key] = undefined;
		}
		else if (typeof handler === 'undefined')
		{
			var handler = makeEventHandler(eventNode, value);
			domNode.addEventListener(key, handler);
			allHandlers[key] = handler;
		}
		else
		{
			handler.info = value;
		}
	}

	domNode.elm_handlers = allHandlers;
}

function makeEventHandler(eventNode, info)
{
	function eventHandler(event)
	{
		var info = eventHandler.info;

		var value = A2(_elm_lang$core$Native_Json.run, info.decoder, event);

		if (value.ctor === 'Ok')
		{
			var options = info.options;
			if (options.stopPropagation)
			{
				event.stopPropagation();
			}
			if (options.preventDefault)
			{
				event.preventDefault();
			}

			var message = value._0;

			var currentEventNode = eventNode;
			while (currentEventNode)
			{
				var tagger = currentEventNode.tagger;
				if (typeof tagger === 'function')
				{
					message = tagger(message);
				}
				else
				{
					for (var i = tagger.length; i--; )
					{
						message = tagger[i](message);
					}
				}
				currentEventNode = currentEventNode.parent;
			}
		}
	};

	eventHandler.info = info;

	return eventHandler;
}

function applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		if (typeof value === 'undefined')
		{
			domNode.removeAttribute(key);
		}
		else
		{
			domNode.setAttribute(key, value);
		}
	}
}

function applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.namespace;
		var value = pair.value;

		if (typeof value === 'undefined')
		{
			domNode.removeAttributeNS(namespace, key);
		}
		else
		{
			domNode.setAttributeNS(namespace, key, value);
		}
	}
}



////////////  DIFF  ////////////


function diff(a, b)
{
	var patches = [];
	diffHelp(a, b, patches, 0);
	return patches;
}


function makePatch(type, index, data)
{
	return {
		index: index,
		type: type,
		data: data,
		domNode: undefined,
		eventNode: undefined
	};
}


function diffHelp(a, b, patches, index)
{
	if (a === b)
	{
		return;
	}

	var aType = a.type;
	var bType = b.type;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (aType !== bType)
	{
		patches.push(makePatch('p-redraw', index, b));
		return;
	}

	// Now we know that both nodes are the same type.
	switch (bType)
	{
		case 'thunk':
			var aArgs = a.args;
			var bArgs = b.args;
			var i = aArgs.length;
			var same = a.func === b.func && i === bArgs.length;
			while (same && i--)
			{
				same = aArgs[i] === bArgs[i];
			}
			if (same)
			{
				b.node = a.node;
				return;
			}
			b.node = b.thunk();
			var subPatches = [];
			diffHelp(a.node, b.node, subPatches, 0);
			if (subPatches.length > 0)
			{
				patches.push(makePatch('p-thunk', index, subPatches));
			}
			return;

		case 'tagger':
			// gather nested taggers
			var aTaggers = a.tagger;
			var bTaggers = b.tagger;
			var nesting = false;

			var aSubNode = a.node;
			while (aSubNode.type === 'tagger')
			{
				nesting = true;

				typeof aTaggers !== 'object'
					? aTaggers = [aTaggers, aSubNode.tagger]
					: aTaggers.push(aSubNode.tagger);

				aSubNode = aSubNode.node;
			}

			var bSubNode = b.node;
			while (bSubNode.type === 'tagger')
			{
				nesting = true;

				typeof bTaggers !== 'object'
					? bTaggers = [bTaggers, bSubNode.tagger]
					: bTaggers.push(bSubNode.tagger);

				bSubNode = bSubNode.node;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && aTaggers.length !== bTaggers.length)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !pairwiseRefEqual(aTaggers, bTaggers) : aTaggers !== bTaggers)
			{
				patches.push(makePatch('p-tagger', index, bTaggers));
			}

			// diff everything below the taggers
			diffHelp(aSubNode, bSubNode, patches, index + 1);
			return;

		case 'text':
			if (a.text !== b.text)
			{
				patches.push(makePatch('p-text', index, b.text));
				return;
			}

			return;

		case 'node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffChildren(a, b, patches, index);
			return;

		case 'keyed-node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffKeyedChildren(a, b, patches, index);
			return;

		case 'custom':
			if (a.impl !== b.impl)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);
			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			var patch = b.impl.diff(a,b);
			if (patch)
			{
				patches.push(makePatch('p-custom', index, patch));
				return;
			}

			return;
	}
}


// assumes the incoming arrays are the same length
function pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function diffFacts(a, b, category)
{
	var diff;

	// look for changes and removals
	for (var aKey in a)
	{
		if (aKey === STYLE_KEY || aKey === EVENT_KEY || aKey === ATTR_KEY || aKey === ATTR_NS_KEY)
		{
			var subDiff = diffFacts(a[aKey], b[aKey] || {}, aKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[aKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(aKey in b))
		{
			diff = diff || {};
			diff[aKey] =
				(typeof category === 'undefined')
					? (typeof a[aKey] === 'string' ? '' : null)
					:
				(category === STYLE_KEY)
					? ''
					:
				(category === EVENT_KEY || category === ATTR_KEY)
					? undefined
					:
				{ namespace: a[aKey].namespace, value: undefined };

			continue;
		}

		var aValue = a[aKey];
		var bValue = b[aKey];

		// reference equal, so don't worry about it
		if (aValue === bValue && aKey !== 'value'
			|| category === EVENT_KEY && equalEvents(aValue, bValue))
		{
			continue;
		}

		diff = diff || {};
		diff[aKey] = bValue;
	}

	// add new stuff
	for (var bKey in b)
	{
		if (!(bKey in a))
		{
			diff = diff || {};
			diff[bKey] = b[bKey];
		}
	}

	return diff;
}


function diffChildren(aParent, bParent, patches, rootIndex)
{
	var aChildren = aParent.children;
	var bChildren = bParent.children;

	var aLen = aChildren.length;
	var bLen = bChildren.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (aLen > bLen)
	{
		patches.push(makePatch('p-remove-last', rootIndex, aLen - bLen));
	}
	else if (aLen < bLen)
	{
		patches.push(makePatch('p-append', rootIndex, bChildren.slice(aLen)));
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	var index = rootIndex;
	var minLen = aLen < bLen ? aLen : bLen;
	for (var i = 0; i < minLen; i++)
	{
		index++;
		var aChild = aChildren[i];
		diffHelp(aChild, bChildren[i], patches, index);
		index += aChild.descendantsCount || 0;
	}
}



////////////  KEYED DIFF  ////////////


function diffKeyedChildren(aParent, bParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var aChildren = aParent.children;
	var bChildren = bParent.children;
	var aLen = aChildren.length;
	var bLen = bChildren.length;
	var aIndex = 0;
	var bIndex = 0;

	var index = rootIndex;

	while (aIndex < aLen && bIndex < bLen)
	{
		var a = aChildren[aIndex];
		var b = bChildren[bIndex];

		var aKey = a._0;
		var bKey = b._0;
		var aNode = a._1;
		var bNode = b._1;

		// check if keys match

		if (aKey === bKey)
		{
			index++;
			diffHelp(aNode, bNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex++;
			bIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var aLookAhead = aIndex + 1 < aLen;
		var bLookAhead = bIndex + 1 < bLen;

		if (aLookAhead)
		{
			var aNext = aChildren[aIndex + 1];
			var aNextKey = aNext._0;
			var aNextNode = aNext._1;
			var oldMatch = bKey === aNextKey;
		}

		if (bLookAhead)
		{
			var bNext = bChildren[bIndex + 1];
			var bNextKey = bNext._0;
			var bNextNode = bNext._1;
			var newMatch = aKey === bNextKey;
		}


		// swap a and b
		if (aLookAhead && bLookAhead && newMatch && oldMatch)
		{
			index++;
			diffHelp(aNode, bNextNode, localPatches, index);
			insertNode(changes, localPatches, aKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			removeNode(changes, localPatches, aKey, aNextNode, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		// insert b
		if (bLookAhead && newMatch)
		{
			index++;
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			diffHelp(aNode, bNextNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex += 1;
			bIndex += 2;
			continue;
		}

		// remove a
		if (aLookAhead && oldMatch)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 1;
			continue;
		}

		// remove a, insert b
		if (aLookAhead && bLookAhead && aNextKey === bNextKey)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNextNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (aIndex < aLen)
	{
		index++;
		var a = aChildren[aIndex];
		var aNode = a._1;
		removeNode(changes, localPatches, a._0, aNode, index);
		index += aNode.descendantsCount || 0;
		aIndex++;
	}

	var endInserts;
	while (bIndex < bLen)
	{
		endInserts = endInserts || [];
		var b = bChildren[bIndex];
		insertNode(changes, localPatches, b._0, b._1, undefined, endInserts);
		bIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || typeof endInserts !== 'undefined')
	{
		patches.push(makePatch('p-reorder', rootIndex, {
			patches: localPatches,
			inserts: inserts,
			endInserts: endInserts
		}));
	}
}



////////////  CHANGES FROM KEYED DIFF  ////////////


var POSTFIX = '_elmW6BL';


function insertNode(changes, localPatches, key, vnode, bIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		entry = {
			tag: 'insert',
			vnode: vnode,
			index: bIndex,
			data: undefined
		};

		inserts.push({ index: bIndex, entry: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.tag === 'remove')
	{
		inserts.push({ index: bIndex, entry: entry });

		entry.tag = 'move';
		var subPatches = [];
		diffHelp(entry.vnode, vnode, subPatches, entry.index);
		entry.index = bIndex;
		entry.data.data = {
			patches: subPatches,
			entry: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	insertNode(changes, localPatches, key + POSTFIX, vnode, bIndex, inserts);
}


function removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		var patch = makePatch('p-remove', index, undefined);
		localPatches.push(patch);

		changes[key] = {
			tag: 'remove',
			vnode: vnode,
			index: index,
			data: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.tag === 'insert')
	{
		entry.tag = 'move';
		var subPatches = [];
		diffHelp(vnode, entry.vnode, subPatches, index);

		var patch = makePatch('p-remove', index, {
			patches: subPatches,
			entry: entry
		});
		localPatches.push(patch);

		return;
	}

	// this key has already been removed or moved, a duplicate!
	removeNode(changes, localPatches, key + POSTFIX, vnode, index);
}



////////////  ADD DOM NODES  ////////////
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function addDomNodes(domNode, vNode, patches, eventNode)
{
	addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.descendantsCount, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.index;

	while (index === low)
	{
		var patchType = patch.type;

		if (patchType === 'p-thunk')
		{
			addDomNodes(domNode, vNode.node, patch.data, eventNode);
		}
		else if (patchType === 'p-reorder')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var subPatches = patch.data.patches;
			if (subPatches.length > 0)
			{
				addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 'p-remove')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var data = patch.data;
			if (typeof data !== 'undefined')
			{
				data.entry.data = domNode;
				var subPatches = data.patches;
				if (subPatches.length > 0)
				{
					addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.index) > high)
		{
			return i;
		}
	}

	switch (vNode.type)
	{
		case 'tagger':
			var subNode = vNode.node;

			while (subNode.type === "tagger")
			{
				subNode = subNode.node;
			}

			return addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);

		case 'node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j];
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'keyed-node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j]._1;
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'text':
		case 'thunk':
			throw new Error('should never traverse `text` or `thunk` nodes like this');
	}
}



////////////  APPLY PATCHES  ////////////


function applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return applyPatchesHelp(rootDomNode, patches);
}

function applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.domNode
		var newNode = applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function applyPatch(domNode, patch)
{
	switch (patch.type)
	{
		case 'p-redraw':
			return applyPatchRedraw(domNode, patch.data, patch.eventNode);

		case 'p-facts':
			applyFacts(domNode, patch.eventNode, patch.data);
			return domNode;

		case 'p-text':
			domNode.replaceData(0, domNode.length, patch.data);
			return domNode;

		case 'p-thunk':
			return applyPatchesHelp(domNode, patch.data);

		case 'p-tagger':
			if (typeof domNode.elm_event_node_ref !== 'undefined')
			{
				domNode.elm_event_node_ref.tagger = patch.data;
			}
			else
			{
				domNode.elm_event_node_ref = { tagger: patch.data, parent: patch.eventNode };
			}
			return domNode;

		case 'p-remove-last':
			var i = patch.data;
			while (i--)
			{
				domNode.removeChild(domNode.lastChild);
			}
			return domNode;

		case 'p-append':
			var newNodes = patch.data;
			for (var i = 0; i < newNodes.length; i++)
			{
				domNode.appendChild(render(newNodes[i], patch.eventNode));
			}
			return domNode;

		case 'p-remove':
			var data = patch.data;
			if (typeof data === 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.entry;
			if (typeof entry.index !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.data = applyPatchesHelp(domNode, data.patches);
			return domNode;

		case 'p-reorder':
			return applyPatchReorder(domNode, patch);

		case 'p-custom':
			var impl = patch.data;
			return impl.applyPatch(domNode, impl.data);

		default:
			throw new Error('Ran into an unknown patch!');
	}
}


function applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = render(vNode, eventNode);

	if (typeof newNode.elm_event_node_ref === 'undefined')
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function applyPatchReorder(domNode, patch)
{
	var data = patch.data;

	// remove end inserts
	var frag = applyPatchReorderEndInsertsHelp(data.endInserts, patch);

	// removals
	domNode = applyPatchesHelp(domNode, data.patches);

	// inserts
	var inserts = data.inserts;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.entry;
		var node = entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode);
		domNode.insertBefore(node, domNode.childNodes[insert.index]);
	}

	// add end inserts
	if (typeof frag !== 'undefined')
	{
		domNode.appendChild(frag);
	}

	return domNode;
}


function applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (typeof endInserts === 'undefined')
	{
		return;
	}

	var frag = localDoc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.entry;
		frag.appendChild(entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode)
		);
	}
	return frag;
}


// PROGRAMS

var program = makeProgram(checkNoFlags);
var programWithFlags = makeProgram(checkYesFlags);

function makeProgram(flagChecker)
{
	return F2(function(debugWrap, impl)
	{
		return function(flagDecoder)
		{
			return function(object, moduleName, debugMetadata)
			{
				var checker = flagChecker(flagDecoder, moduleName);
				if (typeof debugMetadata === 'undefined')
				{
					normalSetup(impl, object, moduleName, checker);
				}
				else
				{
					debugSetup(A2(debugWrap, debugMetadata, impl), object, moduleName, checker);
				}
			};
		};
	});
}

function staticProgram(vNode)
{
	var nothing = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		_elm_lang$core$Platform_Cmd$none
	);
	return A2(program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, {
		init: nothing,
		view: function() { return vNode; },
		update: F2(function() { return nothing; }),
		subscriptions: function() { return _elm_lang$core$Platform_Sub$none; }
	})();
}


// FLAG CHECKERS

function checkNoFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flags === 'undefined')
		{
			return init;
		}

		var errorMessage =
			'The `' + moduleName + '` module does not need flags.\n'
			+ 'Initialize it with no arguments and you should be all set!';

		crash(errorMessage, domNode);
	};
}

function checkYesFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flagDecoder === 'undefined')
		{
			var errorMessage =
				'Are you trying to sneak a Never value into Elm? Trickster!\n'
				+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
				+ 'Use `program` instead if you do not want flags.'

			crash(errorMessage, domNode);
		}

		var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
		if (result.ctor === 'Ok')
		{
			return init(result._0);
		}

		var errorMessage =
			'Trying to initialize the `' + moduleName + '` module with an unexpected flag.\n'
			+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
			+ result._0;

		crash(errorMessage, domNode);
	};
}

function crash(errorMessage, domNode)
{
	if (domNode)
	{
		domNode.innerHTML =
			'<div style="padding-left:1em;">'
			+ '<h2 style="font-weight:normal;"><b>Oops!</b> Something went wrong when starting your Elm program.</h2>'
			+ '<pre style="padding-left:1em;">' + errorMessage + '</pre>'
			+ '</div>';
	}

	throw new Error(errorMessage);
}


//  NORMAL SETUP

function normalSetup(impl, object, moduleName, flagChecker)
{
	object['embed'] = function embed(node, flags)
	{
		while (node.lastChild)
		{
			node.removeChild(node.lastChild);
		}

		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update,
			impl.subscriptions,
			normalRenderer(node, impl.view)
		);
	};

	object['fullscreen'] = function fullscreen(flags)
	{
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update,
			impl.subscriptions,
			normalRenderer(document.body, impl.view)
		);
	};
}

function normalRenderer(parentNode, view)
{
	return function(tagger, initialModel)
	{
		var eventNode = { tagger: tagger, parent: undefined };
		var initialVirtualNode = view(initialModel);
		var domNode = render(initialVirtualNode, eventNode);
		parentNode.appendChild(domNode);
		return makeStepper(domNode, view, initialVirtualNode, eventNode);
	};
}


// STEPPER

var rAF =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { setTimeout(callback, 1000 / 60); };

function makeStepper(domNode, view, initialVirtualNode, eventNode)
{
	var state = 'NO_REQUEST';
	var currNode = initialVirtualNode;
	var nextModel;

	function updateIfNeeded()
	{
		switch (state)
		{
			case 'NO_REQUEST':
				throw new Error(
					'Unexpected draw callback.\n' +
					'Please report this to <https://github.com/elm-lang/virtual-dom/issues>.'
				);

			case 'PENDING_REQUEST':
				rAF(updateIfNeeded);
				state = 'EXTRA_REQUEST';

				var nextNode = view(nextModel);
				var patches = diff(currNode, nextNode);
				domNode = applyPatches(domNode, currNode, patches, eventNode);
				currNode = nextNode;

				return;

			case 'EXTRA_REQUEST':
				state = 'NO_REQUEST';
				return;
		}
	}

	return function stepper(model)
	{
		if (state === 'NO_REQUEST')
		{
			rAF(updateIfNeeded);
		}
		state = 'PENDING_REQUEST';
		nextModel = model;
	};
}


// DEBUG SETUP

function debugSetup(impl, object, moduleName, flagChecker)
{
	object['fullscreen'] = function fullscreen(flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, document.body, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};

	object['embed'] = function fullscreen(node, flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, node, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};
}

function scrollTask(popoutRef)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var doc = popoutRef.doc;
		if (doc)
		{
			var msgs = doc.getElementsByClassName('debugger-sidebar-messages')[0];
			if (msgs)
			{
				msgs.scrollTop = msgs.scrollHeight;
			}
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}


function debugRenderer(moduleName, parentNode, popoutRef, view, viewIn, viewOut)
{
	return function(tagger, initialModel)
	{
		var appEventNode = { tagger: tagger, parent: undefined };
		var eventNode = { tagger: tagger, parent: undefined };

		// make normal stepper
		var appVirtualNode = view(initialModel);
		var appNode = render(appVirtualNode, appEventNode);
		parentNode.appendChild(appNode);
		var appStepper = makeStepper(appNode, view, appVirtualNode, appEventNode);

		// make overlay stepper
		var overVirtualNode = viewIn(initialModel)._1;
		var overNode = render(overVirtualNode, eventNode);
		parentNode.appendChild(overNode);
		var wrappedViewIn = wrapViewIn(appEventNode, overNode, viewIn);
		var overStepper = makeStepper(overNode, wrappedViewIn, overVirtualNode, eventNode);

		// make debugger stepper
		var debugStepper = makeDebugStepper(initialModel, viewOut, eventNode, parentNode, moduleName, popoutRef);

		return function stepper(model)
		{
			appStepper(model);
			overStepper(model);
			debugStepper(model);
		}
	};
}

function makeDebugStepper(initialModel, view, eventNode, parentNode, moduleName, popoutRef)
{
	var curr;
	var domNode;

	return function stepper(model)
	{
		if (!model.isDebuggerOpen)
		{
			return;
		}

		if (!popoutRef.doc)
		{
			curr = view(model);
			domNode = openDebugWindow(moduleName, popoutRef, curr, eventNode);
			return;
		}

		// switch to document of popout
		localDoc = popoutRef.doc;

		var next = view(model);
		var patches = diff(curr, next);
		domNode = applyPatches(domNode, curr, patches, eventNode);
		curr = next;

		// switch back to normal document
		localDoc = document;
	};
}

function openDebugWindow(moduleName, popoutRef, virtualNode, eventNode)
{
	var w = 900;
	var h = 360;
	var x = screen.width - w;
	var y = screen.height - h;
	var debugWindow = window.open('', '', 'width=' + w + ',height=' + h + ',left=' + x + ',top=' + y);

	// switch to window document
	localDoc = debugWindow.document;

	popoutRef.doc = localDoc;
	localDoc.title = 'Debugger - ' + moduleName;
	localDoc.body.style.margin = '0';
	localDoc.body.style.padding = '0';
	var domNode = render(virtualNode, eventNode);
	localDoc.body.appendChild(domNode);

	localDoc.addEventListener('keydown', function(event) {
		if (event.metaKey && event.which === 82)
		{
			window.location.reload();
		}
		if (event.which === 38)
		{
			eventNode.tagger({ ctor: 'Up' });
			event.preventDefault();
		}
		if (event.which === 40)
		{
			eventNode.tagger({ ctor: 'Down' });
			event.preventDefault();
		}
	});

	function close()
	{
		popoutRef.doc = undefined;
		debugWindow.close();
	}
	window.addEventListener('unload', close);
	debugWindow.addEventListener('unload', function() {
		popoutRef.doc = undefined;
		window.removeEventListener('unload', close);
		eventNode.tagger({ ctor: 'Close' });
	});

	// switch back to the normal document
	localDoc = document;

	return domNode;
}


// BLOCK EVENTS

function wrapViewIn(appEventNode, overlayNode, viewIn)
{
	var ignorer = makeIgnorer(overlayNode);
	var blocking = 'Normal';
	var overflow;

	var normalTagger = appEventNode.tagger;
	var blockTagger = function() {};

	return function(model)
	{
		var tuple = viewIn(model);
		var newBlocking = tuple._0.ctor;
		appEventNode.tagger = newBlocking === 'Normal' ? normalTagger : blockTagger;
		if (blocking !== newBlocking)
		{
			traverse('removeEventListener', ignorer, blocking);
			traverse('addEventListener', ignorer, newBlocking);

			if (blocking === 'Normal')
			{
				overflow = document.body.style.overflow;
				document.body.style.overflow = 'hidden';
			}

			if (newBlocking === 'Normal')
			{
				document.body.style.overflow = overflow;
			}

			blocking = newBlocking;
		}
		return tuple._1;
	}
}

function traverse(verbEventListener, ignorer, blocking)
{
	switch(blocking)
	{
		case 'Normal':
			return;

		case 'Pause':
			return traverseHelp(verbEventListener, ignorer, mostEvents);

		case 'Message':
			return traverseHelp(verbEventListener, ignorer, allEvents);
	}
}

function traverseHelp(verbEventListener, handler, eventNames)
{
	for (var i = 0; i < eventNames.length; i++)
	{
		document.body[verbEventListener](eventNames[i], handler, true);
	}
}

function makeIgnorer(overlayNode)
{
	return function(event)
	{
		if (event.type === 'keydown' && event.metaKey && event.which === 82)
		{
			return;
		}

		var isScroll = event.type === 'scroll' || event.type === 'wheel';

		var node = event.target;
		while (node !== null)
		{
			if (node.className === 'elm-overlay-message-details' && isScroll)
			{
				return;
			}

			if (node === overlayNode && !isScroll)
			{
				return;
			}
			node = node.parentNode;
		}

		event.stopPropagation();
		event.preventDefault();
	}
}

var mostEvents = [
	'click', 'dblclick', 'mousemove',
	'mouseup', 'mousedown', 'mouseenter', 'mouseleave',
	'touchstart', 'touchend', 'touchcancel', 'touchmove',
	'pointerdown', 'pointerup', 'pointerover', 'pointerout',
	'pointerenter', 'pointerleave', 'pointermove', 'pointercancel',
	'dragstart', 'drag', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop',
	'keyup', 'keydown', 'keypress',
	'input', 'change',
	'focus', 'blur'
];

var allEvents = mostEvents.concat('wheel', 'scroll');


return {
	node: node,
	text: text,
	custom: custom,
	map: F2(map),

	on: F3(on),
	style: style,
	property: F2(property),
	attribute: F2(attribute),
	attributeNS: F3(attributeNS),
	mapProperty: F2(mapProperty),

	lazy: F2(lazy),
	lazy2: F3(lazy2),
	lazy3: F4(lazy3),
	keyedNode: F3(keyedNode),

	program: program,
	programWithFlags: programWithFlags,
	staticProgram: staticProgram
};

}();

var _elm_lang$virtual_dom$VirtualDom$programWithFlags = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.programWithFlags, _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags, impl);
};
var _elm_lang$virtual_dom$VirtualDom$program = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, impl);
};
var _elm_lang$virtual_dom$VirtualDom$keyedNode = _elm_lang$virtual_dom$Native_VirtualDom.keyedNode;
var _elm_lang$virtual_dom$VirtualDom$lazy3 = _elm_lang$virtual_dom$Native_VirtualDom.lazy3;
var _elm_lang$virtual_dom$VirtualDom$lazy2 = _elm_lang$virtual_dom$Native_VirtualDom.lazy2;
var _elm_lang$virtual_dom$VirtualDom$lazy = _elm_lang$virtual_dom$Native_VirtualDom.lazy;
var _elm_lang$virtual_dom$VirtualDom$defaultOptions = {stopPropagation: false, preventDefault: false};
var _elm_lang$virtual_dom$VirtualDom$onWithOptions = _elm_lang$virtual_dom$Native_VirtualDom.on;
var _elm_lang$virtual_dom$VirtualDom$on = F2(
	function (eventName, decoder) {
		return A3(_elm_lang$virtual_dom$VirtualDom$onWithOptions, eventName, _elm_lang$virtual_dom$VirtualDom$defaultOptions, decoder);
	});
var _elm_lang$virtual_dom$VirtualDom$style = _elm_lang$virtual_dom$Native_VirtualDom.style;
var _elm_lang$virtual_dom$VirtualDom$mapProperty = _elm_lang$virtual_dom$Native_VirtualDom.mapProperty;
var _elm_lang$virtual_dom$VirtualDom$attributeNS = _elm_lang$virtual_dom$Native_VirtualDom.attributeNS;
var _elm_lang$virtual_dom$VirtualDom$attribute = _elm_lang$virtual_dom$Native_VirtualDom.attribute;
var _elm_lang$virtual_dom$VirtualDom$property = _elm_lang$virtual_dom$Native_VirtualDom.property;
var _elm_lang$virtual_dom$VirtualDom$map = _elm_lang$virtual_dom$Native_VirtualDom.map;
var _elm_lang$virtual_dom$VirtualDom$text = _elm_lang$virtual_dom$Native_VirtualDom.text;
var _elm_lang$virtual_dom$VirtualDom$node = _elm_lang$virtual_dom$Native_VirtualDom.node;
var _elm_lang$virtual_dom$VirtualDom$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});
var _elm_lang$virtual_dom$VirtualDom$Node = {ctor: 'Node'};
var _elm_lang$virtual_dom$VirtualDom$Property = {ctor: 'Property'};

var _elm_lang$html$Html$programWithFlags = _elm_lang$virtual_dom$VirtualDom$programWithFlags;
var _elm_lang$html$Html$program = _elm_lang$virtual_dom$VirtualDom$program;
var _elm_lang$html$Html$beginnerProgram = function (_p0) {
	var _p1 = _p0;
	return _elm_lang$html$Html$program(
		{
			init: A2(
				_elm_lang$core$Platform_Cmd_ops['!'],
				_p1.model,
				{ctor: '[]'}),
			update: F2(
				function (msg, model) {
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						A2(_p1.update, msg, model),
						{ctor: '[]'});
				}),
			view: _p1.view,
			subscriptions: function (_p2) {
				return _elm_lang$core$Platform_Sub$none;
			}
		});
};
var _elm_lang$html$Html$map = _elm_lang$virtual_dom$VirtualDom$map;
var _elm_lang$html$Html$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$html$Html$node = _elm_lang$virtual_dom$VirtualDom$node;
var _elm_lang$html$Html$body = _elm_lang$html$Html$node('body');
var _elm_lang$html$Html$section = _elm_lang$html$Html$node('section');
var _elm_lang$html$Html$nav = _elm_lang$html$Html$node('nav');
var _elm_lang$html$Html$article = _elm_lang$html$Html$node('article');
var _elm_lang$html$Html$aside = _elm_lang$html$Html$node('aside');
var _elm_lang$html$Html$h1 = _elm_lang$html$Html$node('h1');
var _elm_lang$html$Html$h2 = _elm_lang$html$Html$node('h2');
var _elm_lang$html$Html$h3 = _elm_lang$html$Html$node('h3');
var _elm_lang$html$Html$h4 = _elm_lang$html$Html$node('h4');
var _elm_lang$html$Html$h5 = _elm_lang$html$Html$node('h5');
var _elm_lang$html$Html$h6 = _elm_lang$html$Html$node('h6');
var _elm_lang$html$Html$header = _elm_lang$html$Html$node('header');
var _elm_lang$html$Html$footer = _elm_lang$html$Html$node('footer');
var _elm_lang$html$Html$address = _elm_lang$html$Html$node('address');
var _elm_lang$html$Html$main_ = _elm_lang$html$Html$node('main');
var _elm_lang$html$Html$p = _elm_lang$html$Html$node('p');
var _elm_lang$html$Html$hr = _elm_lang$html$Html$node('hr');
var _elm_lang$html$Html$pre = _elm_lang$html$Html$node('pre');
var _elm_lang$html$Html$blockquote = _elm_lang$html$Html$node('blockquote');
var _elm_lang$html$Html$ol = _elm_lang$html$Html$node('ol');
var _elm_lang$html$Html$ul = _elm_lang$html$Html$node('ul');
var _elm_lang$html$Html$li = _elm_lang$html$Html$node('li');
var _elm_lang$html$Html$dl = _elm_lang$html$Html$node('dl');
var _elm_lang$html$Html$dt = _elm_lang$html$Html$node('dt');
var _elm_lang$html$Html$dd = _elm_lang$html$Html$node('dd');
var _elm_lang$html$Html$figure = _elm_lang$html$Html$node('figure');
var _elm_lang$html$Html$figcaption = _elm_lang$html$Html$node('figcaption');
var _elm_lang$html$Html$div = _elm_lang$html$Html$node('div');
var _elm_lang$html$Html$a = _elm_lang$html$Html$node('a');
var _elm_lang$html$Html$em = _elm_lang$html$Html$node('em');
var _elm_lang$html$Html$strong = _elm_lang$html$Html$node('strong');
var _elm_lang$html$Html$small = _elm_lang$html$Html$node('small');
var _elm_lang$html$Html$s = _elm_lang$html$Html$node('s');
var _elm_lang$html$Html$cite = _elm_lang$html$Html$node('cite');
var _elm_lang$html$Html$q = _elm_lang$html$Html$node('q');
var _elm_lang$html$Html$dfn = _elm_lang$html$Html$node('dfn');
var _elm_lang$html$Html$abbr = _elm_lang$html$Html$node('abbr');
var _elm_lang$html$Html$time = _elm_lang$html$Html$node('time');
var _elm_lang$html$Html$code = _elm_lang$html$Html$node('code');
var _elm_lang$html$Html$var = _elm_lang$html$Html$node('var');
var _elm_lang$html$Html$samp = _elm_lang$html$Html$node('samp');
var _elm_lang$html$Html$kbd = _elm_lang$html$Html$node('kbd');
var _elm_lang$html$Html$sub = _elm_lang$html$Html$node('sub');
var _elm_lang$html$Html$sup = _elm_lang$html$Html$node('sup');
var _elm_lang$html$Html$i = _elm_lang$html$Html$node('i');
var _elm_lang$html$Html$b = _elm_lang$html$Html$node('b');
var _elm_lang$html$Html$u = _elm_lang$html$Html$node('u');
var _elm_lang$html$Html$mark = _elm_lang$html$Html$node('mark');
var _elm_lang$html$Html$ruby = _elm_lang$html$Html$node('ruby');
var _elm_lang$html$Html$rt = _elm_lang$html$Html$node('rt');
var _elm_lang$html$Html$rp = _elm_lang$html$Html$node('rp');
var _elm_lang$html$Html$bdi = _elm_lang$html$Html$node('bdi');
var _elm_lang$html$Html$bdo = _elm_lang$html$Html$node('bdo');
var _elm_lang$html$Html$span = _elm_lang$html$Html$node('span');
var _elm_lang$html$Html$br = _elm_lang$html$Html$node('br');
var _elm_lang$html$Html$wbr = _elm_lang$html$Html$node('wbr');
var _elm_lang$html$Html$ins = _elm_lang$html$Html$node('ins');
var _elm_lang$html$Html$del = _elm_lang$html$Html$node('del');
var _elm_lang$html$Html$img = _elm_lang$html$Html$node('img');
var _elm_lang$html$Html$iframe = _elm_lang$html$Html$node('iframe');
var _elm_lang$html$Html$embed = _elm_lang$html$Html$node('embed');
var _elm_lang$html$Html$object = _elm_lang$html$Html$node('object');
var _elm_lang$html$Html$param = _elm_lang$html$Html$node('param');
var _elm_lang$html$Html$video = _elm_lang$html$Html$node('video');
var _elm_lang$html$Html$audio = _elm_lang$html$Html$node('audio');
var _elm_lang$html$Html$source = _elm_lang$html$Html$node('source');
var _elm_lang$html$Html$track = _elm_lang$html$Html$node('track');
var _elm_lang$html$Html$canvas = _elm_lang$html$Html$node('canvas');
var _elm_lang$html$Html$math = _elm_lang$html$Html$node('math');
var _elm_lang$html$Html$table = _elm_lang$html$Html$node('table');
var _elm_lang$html$Html$caption = _elm_lang$html$Html$node('caption');
var _elm_lang$html$Html$colgroup = _elm_lang$html$Html$node('colgroup');
var _elm_lang$html$Html$col = _elm_lang$html$Html$node('col');
var _elm_lang$html$Html$tbody = _elm_lang$html$Html$node('tbody');
var _elm_lang$html$Html$thead = _elm_lang$html$Html$node('thead');
var _elm_lang$html$Html$tfoot = _elm_lang$html$Html$node('tfoot');
var _elm_lang$html$Html$tr = _elm_lang$html$Html$node('tr');
var _elm_lang$html$Html$td = _elm_lang$html$Html$node('td');
var _elm_lang$html$Html$th = _elm_lang$html$Html$node('th');
var _elm_lang$html$Html$form = _elm_lang$html$Html$node('form');
var _elm_lang$html$Html$fieldset = _elm_lang$html$Html$node('fieldset');
var _elm_lang$html$Html$legend = _elm_lang$html$Html$node('legend');
var _elm_lang$html$Html$label = _elm_lang$html$Html$node('label');
var _elm_lang$html$Html$input = _elm_lang$html$Html$node('input');
var _elm_lang$html$Html$button = _elm_lang$html$Html$node('button');
var _elm_lang$html$Html$select = _elm_lang$html$Html$node('select');
var _elm_lang$html$Html$datalist = _elm_lang$html$Html$node('datalist');
var _elm_lang$html$Html$optgroup = _elm_lang$html$Html$node('optgroup');
var _elm_lang$html$Html$option = _elm_lang$html$Html$node('option');
var _elm_lang$html$Html$textarea = _elm_lang$html$Html$node('textarea');
var _elm_lang$html$Html$keygen = _elm_lang$html$Html$node('keygen');
var _elm_lang$html$Html$output = _elm_lang$html$Html$node('output');
var _elm_lang$html$Html$progress = _elm_lang$html$Html$node('progress');
var _elm_lang$html$Html$meter = _elm_lang$html$Html$node('meter');
var _elm_lang$html$Html$details = _elm_lang$html$Html$node('details');
var _elm_lang$html$Html$summary = _elm_lang$html$Html$node('summary');
var _elm_lang$html$Html$menuitem = _elm_lang$html$Html$node('menuitem');
var _elm_lang$html$Html$menu = _elm_lang$html$Html$node('menu');

var _elm_lang$html$Html_Attributes$map = _elm_lang$virtual_dom$VirtualDom$mapProperty;
var _elm_lang$html$Html_Attributes$attribute = _elm_lang$virtual_dom$VirtualDom$attribute;
var _elm_lang$html$Html_Attributes$contextmenu = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'contextmenu', value);
};
var _elm_lang$html$Html_Attributes$draggable = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'draggable', value);
};
var _elm_lang$html$Html_Attributes$itemprop = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'itemprop', value);
};
var _elm_lang$html$Html_Attributes$tabindex = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'tabIndex',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$charset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'charset', value);
};
var _elm_lang$html$Html_Attributes$height = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'height',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$width = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'width',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$formaction = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'formAction', value);
};
var _elm_lang$html$Html_Attributes$list = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'list', value);
};
var _elm_lang$html$Html_Attributes$minlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'minLength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$maxlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'maxlength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$size = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'size',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$form = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'form', value);
};
var _elm_lang$html$Html_Attributes$cols = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'cols',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rows = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rows',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$challenge = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'challenge', value);
};
var _elm_lang$html$Html_Attributes$media = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'media', value);
};
var _elm_lang$html$Html_Attributes$rel = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'rel', value);
};
var _elm_lang$html$Html_Attributes$datetime = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'datetime', value);
};
var _elm_lang$html$Html_Attributes$pubdate = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'pubdate', value);
};
var _elm_lang$html$Html_Attributes$colspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'colspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rowspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rowspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$manifest = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'manifest', value);
};
var _elm_lang$html$Html_Attributes$property = _elm_lang$virtual_dom$VirtualDom$property;
var _elm_lang$html$Html_Attributes$stringProperty = F2(
	function (name, string) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$string(string));
	});
var _elm_lang$html$Html_Attributes$class = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'className', name);
};
var _elm_lang$html$Html_Attributes$id = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'id', name);
};
var _elm_lang$html$Html_Attributes$title = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'title', name);
};
var _elm_lang$html$Html_Attributes$accesskey = function ($char) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'accessKey',
		_elm_lang$core$String$fromChar($char));
};
var _elm_lang$html$Html_Attributes$dir = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dir', value);
};
var _elm_lang$html$Html_Attributes$dropzone = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dropzone', value);
};
var _elm_lang$html$Html_Attributes$lang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'lang', value);
};
var _elm_lang$html$Html_Attributes$content = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'content', value);
};
var _elm_lang$html$Html_Attributes$httpEquiv = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'httpEquiv', value);
};
var _elm_lang$html$Html_Attributes$language = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'language', value);
};
var _elm_lang$html$Html_Attributes$src = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'src', value);
};
var _elm_lang$html$Html_Attributes$alt = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'alt', value);
};
var _elm_lang$html$Html_Attributes$preload = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'preload', value);
};
var _elm_lang$html$Html_Attributes$poster = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'poster', value);
};
var _elm_lang$html$Html_Attributes$kind = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'kind', value);
};
var _elm_lang$html$Html_Attributes$srclang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srclang', value);
};
var _elm_lang$html$Html_Attributes$sandbox = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'sandbox', value);
};
var _elm_lang$html$Html_Attributes$srcdoc = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srcdoc', value);
};
var _elm_lang$html$Html_Attributes$type_ = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'type', value);
};
var _elm_lang$html$Html_Attributes$value = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'value', value);
};
var _elm_lang$html$Html_Attributes$defaultValue = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'defaultValue', value);
};
var _elm_lang$html$Html_Attributes$placeholder = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'placeholder', value);
};
var _elm_lang$html$Html_Attributes$accept = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'accept', value);
};
var _elm_lang$html$Html_Attributes$acceptCharset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'acceptCharset', value);
};
var _elm_lang$html$Html_Attributes$action = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'action', value);
};
var _elm_lang$html$Html_Attributes$autocomplete = function (bool) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'autocomplete',
		bool ? 'on' : 'off');
};
var _elm_lang$html$Html_Attributes$enctype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'enctype', value);
};
var _elm_lang$html$Html_Attributes$method = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'method', value);
};
var _elm_lang$html$Html_Attributes$name = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'name', value);
};
var _elm_lang$html$Html_Attributes$pattern = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'pattern', value);
};
var _elm_lang$html$Html_Attributes$for = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'htmlFor', value);
};
var _elm_lang$html$Html_Attributes$max = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'max', value);
};
var _elm_lang$html$Html_Attributes$min = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'min', value);
};
var _elm_lang$html$Html_Attributes$step = function (n) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'step', n);
};
var _elm_lang$html$Html_Attributes$wrap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'wrap', value);
};
var _elm_lang$html$Html_Attributes$usemap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'useMap', value);
};
var _elm_lang$html$Html_Attributes$shape = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'shape', value);
};
var _elm_lang$html$Html_Attributes$coords = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'coords', value);
};
var _elm_lang$html$Html_Attributes$keytype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'keytype', value);
};
var _elm_lang$html$Html_Attributes$align = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'align', value);
};
var _elm_lang$html$Html_Attributes$cite = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'cite', value);
};
var _elm_lang$html$Html_Attributes$href = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'href', value);
};
var _elm_lang$html$Html_Attributes$target = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'target', value);
};
var _elm_lang$html$Html_Attributes$downloadAs = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'download', value);
};
var _elm_lang$html$Html_Attributes$hreflang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'hreflang', value);
};
var _elm_lang$html$Html_Attributes$ping = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'ping', value);
};
var _elm_lang$html$Html_Attributes$start = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'start',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$headers = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'headers', value);
};
var _elm_lang$html$Html_Attributes$scope = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'scope', value);
};
var _elm_lang$html$Html_Attributes$boolProperty = F2(
	function (name, bool) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$bool(bool));
	});
var _elm_lang$html$Html_Attributes$hidden = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'hidden', bool);
};
var _elm_lang$html$Html_Attributes$contenteditable = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'contentEditable', bool);
};
var _elm_lang$html$Html_Attributes$spellcheck = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'spellcheck', bool);
};
var _elm_lang$html$Html_Attributes$async = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'async', bool);
};
var _elm_lang$html$Html_Attributes$defer = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'defer', bool);
};
var _elm_lang$html$Html_Attributes$scoped = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'scoped', bool);
};
var _elm_lang$html$Html_Attributes$autoplay = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autoplay', bool);
};
var _elm_lang$html$Html_Attributes$controls = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'controls', bool);
};
var _elm_lang$html$Html_Attributes$loop = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'loop', bool);
};
var _elm_lang$html$Html_Attributes$default = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'default', bool);
};
var _elm_lang$html$Html_Attributes$seamless = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'seamless', bool);
};
var _elm_lang$html$Html_Attributes$checked = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'checked', bool);
};
var _elm_lang$html$Html_Attributes$selected = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'selected', bool);
};
var _elm_lang$html$Html_Attributes$autofocus = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autofocus', bool);
};
var _elm_lang$html$Html_Attributes$disabled = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'disabled', bool);
};
var _elm_lang$html$Html_Attributes$multiple = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'multiple', bool);
};
var _elm_lang$html$Html_Attributes$novalidate = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'noValidate', bool);
};
var _elm_lang$html$Html_Attributes$readonly = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'readOnly', bool);
};
var _elm_lang$html$Html_Attributes$required = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'required', bool);
};
var _elm_lang$html$Html_Attributes$ismap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'isMap', value);
};
var _elm_lang$html$Html_Attributes$download = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'download', bool);
};
var _elm_lang$html$Html_Attributes$reversed = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'reversed', bool);
};
var _elm_lang$html$Html_Attributes$classList = function (list) {
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$String$join,
			' ',
			A2(
				_elm_lang$core$List$map,
				_elm_lang$core$Tuple$first,
				A2(_elm_lang$core$List$filter, _elm_lang$core$Tuple$second, list))));
};
var _elm_lang$html$Html_Attributes$style = _elm_lang$virtual_dom$VirtualDom$style;

var _rtfeldman$html_test_runner$Test_Runner_Html_App_Internal$SubMsg = function (a) {
	return {ctor: 'SubMsg', _0: a};
};
var _rtfeldman$html_test_runner$Test_Runner_Html_App_Internal$Init = function (a) {
	return {ctor: 'Init', _0: a};
};
var _rtfeldman$html_test_runner$Test_Runner_Html_App_Internal$Initialized = F2(
	function (a, b) {
		return {ctor: 'Initialized', _0: a, _1: b};
	});
var _rtfeldman$html_test_runner$Test_Runner_Html_App_Internal$Uninitialized = F5(
	function (a, b, c, d, e) {
		return {ctor: 'Uninitialized', _0: a, _1: b, _2: c, _3: d, _4: e};
	});

var _rtfeldman$html_test_runner$Test_Runner_Html_App$defaultRunCount = 100;
var _rtfeldman$html_test_runner$Test_Runner_Html_App$toThunksHelp = F2(
	function (labels, runner) {
		toThunksHelp:
		while (true) {
			var _p0 = runner;
			switch (_p0.ctor) {
				case 'Runnable':
					return {
						ctor: '::',
						_0: function (_p1) {
							var _p2 = _p1;
							return {
								ctor: '_Tuple2',
								_0: labels,
								_1: _elm_community$elm_test$Test_Runner$run(_p0._0)
							};
						},
						_1: {ctor: '[]'}
					};
				case 'Labeled':
					var _v2 = {ctor: '::', _0: _p0._0, _1: labels},
						_v3 = _p0._1;
					labels = _v2;
					runner = _v3;
					continue toThunksHelp;
				default:
					return A2(
						_elm_lang$core$List$concatMap,
						_rtfeldman$html_test_runner$Test_Runner_Html_App$toThunksHelp(labels),
						_p0._0);
			}
		}
	});
var _rtfeldman$html_test_runner$Test_Runner_Html_App$toThunks = _rtfeldman$html_test_runner$Test_Runner_Html_App$toThunksHelp(
	{ctor: '[]'});
var _rtfeldman$html_test_runner$Test_Runner_Html_App$subscriptions = F2(
	function (subs, model) {
		var _p3 = model;
		if (_p3.ctor === 'Uninitialized') {
			return _elm_lang$core$Platform_Sub$none;
		} else {
			return A2(
				_elm_lang$core$Platform_Sub$map,
				_rtfeldman$html_test_runner$Test_Runner_Html_App_Internal$SubMsg,
				subs(_p3._1));
		}
	});
var _rtfeldman$html_test_runner$Test_Runner_Html_App$initOrView = F2(
	function (view, model) {
		var _p4 = model;
		if (_p4.ctor === 'Uninitialized') {
			return _elm_lang$html$Html$text('');
		} else {
			return A2(
				_elm_lang$html$Html$map,
				_rtfeldman$html_test_runner$Test_Runner_Html_App_Internal$SubMsg,
				view(_p4._1));
		}
	});
var _rtfeldman$html_test_runner$Test_Runner_Html_App$timeToSeed = function (time) {
	return _mgold$elm_random_pcg$Random_Pcg$initialSeed(
		_elm_lang$core$Basics$floor(4294967295 * time));
};
var _rtfeldman$html_test_runner$Test_Runner_Html_App$initOrUpdate = F2(
	function (msg, maybeModel) {
		var _p5 = maybeModel;
		if (_p5.ctor === 'Uninitialized') {
			var _p6 = msg;
			if (_p6.ctor === 'Init') {
				var _p9 = _p6._0;
				var finalSeed = function () {
					var _p7 = _p5._1;
					if (_p7.ctor === 'Just') {
						return _p7._0;
					} else {
						return _rtfeldman$html_test_runner$Test_Runner_Html_App$timeToSeed(_p9);
					}
				}();
				var _p8 = A2(
					_p5._4,
					_p9,
					_rtfeldman$html_test_runner$Test_Runner_Html_App$toThunks(
						A3(_elm_community$elm_test$Test_Runner$fromTest, _p5._2, finalSeed, _p5._3)));
				var subModel = _p8._0;
				var subCmd = _p8._1;
				return {
					ctor: '_Tuple2',
					_0: A2(_rtfeldman$html_test_runner$Test_Runner_Html_App_Internal$Initialized, _p5._0, subModel),
					_1: A2(_elm_lang$core$Platform_Cmd$map, _rtfeldman$html_test_runner$Test_Runner_Html_App_Internal$SubMsg, subCmd)
				};
			} else {
				return _elm_lang$core$Native_Utils.crashCase(
					'Test.Runner.Html.App',
					{
						start: {line: 30, column: 13},
						end: {line: 50, column: 70}
					},
					_p6)('Attempted to run a SubMsg pre-Init!');
			}
		} else {
			var _p14 = _p5._0;
			var _p11 = msg;
			if (_p11.ctor === 'SubMsg') {
				var _p12 = A2(_p14, _p11._0, _p5._1);
				var newModel = _p12._0;
				var cmd = _p12._1;
				return {
					ctor: '_Tuple2',
					_0: A2(_rtfeldman$html_test_runner$Test_Runner_Html_App_Internal$Initialized, _p14, newModel),
					_1: A2(_elm_lang$core$Platform_Cmd$map, _rtfeldman$html_test_runner$Test_Runner_Html_App_Internal$SubMsg, cmd)
				};
			} else {
				return _elm_lang$core$Native_Utils.crashCase(
					'Test.Runner.Html.App',
					{
						start: {line: 53, column: 13},
						end: {line: 62, column: 59}
					},
					_p11)('Attempted to init twice!');
			}
		}
	});
var _rtfeldman$html_test_runner$Test_Runner_Html_App$run = F3(
	function (runnerOpts, appOpts, test) {
		var cmd = A2(_elm_lang$core$Task$perform, _rtfeldman$html_test_runner$Test_Runner_Html_App_Internal$Init, _elm_lang$core$Time$now);
		var runs = A2(_elm_lang$core$Maybe$withDefault, _rtfeldman$html_test_runner$Test_Runner_Html_App$defaultRunCount, runnerOpts.runs);
		var init = {
			ctor: '_Tuple2',
			_0: A5(_rtfeldman$html_test_runner$Test_Runner_Html_App_Internal$Uninitialized, appOpts.update, runnerOpts.seed, runs, test, appOpts.init),
			_1: cmd
		};
		return _elm_lang$html$Html$program(
			{
				init: init,
				update: _rtfeldman$html_test_runner$Test_Runner_Html_App$initOrUpdate,
				view: _rtfeldman$html_test_runner$Test_Runner_Html_App$initOrView(appOpts.view),
				subscriptions: _rtfeldman$html_test_runner$Test_Runner_Html_App$subscriptions(appOpts.subscriptions)
			});
	});
var _rtfeldman$html_test_runner$Test_Runner_Html_App$RunnerOptions = F2(
	function (a, b) {
		return {seed: a, runs: b};
	});
var _rtfeldman$html_test_runner$Test_Runner_Html_App$AppOptions = F4(
	function (a, b, c, d) {
		return {init: a, update: b, view: c, subscriptions: d};
	});

var _rtfeldman$html_test_runner$Test_Runner_Html$formatDuration = function (time) {
	return A2(
		_elm_lang$core$Basics_ops['++'],
		_elm_lang$core$Basics$toString(time),
		' ms');
};
var _rtfeldman$html_test_runner$Test_Runner_Html$warn = F2(
	function (str, result) {
		var _p0 = _elm_lang$core$Debug$log(str);
		return result;
	});
var _rtfeldman$html_test_runner$Test_Runner_Html$resultsStyle = _elm_lang$html$Html_Attributes$style(
	{
		ctor: '::',
		_0: {ctor: '_Tuple2', _0: 'font-size', _1: '14px'},
		_1: {
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: 'line-height', _1: '1.3'},
			_1: {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 'font-family', _1: 'Menlo, Consolas, \"Fira Mono\", \"DejaVu Sans Mono\", \"Liberation Monospace\", \"Liberation Mono\", Monaco, \"Lucida Console\", \"Courier New\", monospace'},
				_1: {ctor: '[]'}
			}
		}
	});
var _rtfeldman$html_test_runner$Test_Runner_Html$withColorChar = F3(
	function ($char, textColor, str) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$style(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'color', _1: textColor},
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text(
					A2(
						_elm_lang$core$String$cons,
						$char,
						A2(
							_elm_lang$core$String$cons,
							_elm_lang$core$Native_Utils.chr(' '),
							str))),
				_1: {ctor: '[]'}
			});
	});
var _rtfeldman$html_test_runner$Test_Runner_Html$withoutEmptyStrings = _elm_lang$core$List$filter(
	F2(
		function (x, y) {
			return !_elm_lang$core$Native_Utils.eq(x, y);
		})(''));
var _rtfeldman$html_test_runner$Test_Runner_Html$messageAttributes = {
	ctor: '::',
	_0: _elm_lang$html$Html_Attributes$width(80),
	_1: {
		ctor: '::',
		_0: _elm_lang$html$Html_Attributes$style(
			{
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 'margin-left', _1: '32px'},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'margin-bottom', _1: '40px'},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'font-size', _1: 'inherit'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'font-family', _1: 'inherit'},
							_1: {ctor: '[]'}
						}
					}
				}
			}),
		_1: {ctor: '[]'}
	}
};
var _rtfeldman$html_test_runner$Test_Runner_Html$givenAttributes = {
	ctor: '::',
	_0: _elm_lang$html$Html_Attributes$width(80),
	_1: {
		ctor: '::',
		_0: _elm_lang$html$Html_Attributes$style(
			{
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 'margin-bottom', _1: '24px'},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'color', _1: 'darkgray'},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'font-size', _1: 'inherit'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'font-family', _1: 'inherit'},
							_1: {ctor: '[]'}
						}
					}
				}
			}),
		_1: {ctor: '[]'}
	}
};
var _rtfeldman$html_test_runner$Test_Runner_Html$viewFailure = function (expectation) {
	var _p1 = _elm_community$elm_test$Expect$getFailure(expectation);
	if (_p1.ctor === 'Just') {
		var _p2 = _p1._0.given;
		var givenElem = _elm_lang$core$String$isEmpty(_p2) ? _elm_lang$html$Html$text('') : A2(
			_elm_lang$html$Html$pre,
			_rtfeldman$html_test_runner$Test_Runner_Html$givenAttributes,
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text(
					A2(_elm_lang$core$Basics_ops['++'], 'Given ', _p2)),
				_1: {ctor: '[]'}
			});
		return _elm_lang$core$Maybe$Just(
			A2(
				_elm_lang$html$Html$div,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: givenElem,
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$pre,
							_rtfeldman$html_test_runner$Test_Runner_Html$messageAttributes,
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text(_p1._0.message),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				}));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _rtfeldman$html_test_runner$Test_Runner_Html$viewLabels = A2(
	_elm_community$elm_test$Test_Runner$formatLabels,
	A2(
		_rtfeldman$html_test_runner$Test_Runner_Html$withColorChar,
		_elm_lang$core$Native_Utils.chr('↓'),
		'darkgray'),
	A2(
		_rtfeldman$html_test_runner$Test_Runner_Html$withColorChar,
		_elm_lang$core$Native_Utils.chr('✗'),
		'hsla(3, 100%, 40%, 1.0)'));
var _rtfeldman$html_test_runner$Test_Runner_Html$viewFailures = function (_p3) {
	var _p4 = _p3;
	return A2(
		_elm_lang$html$Html$li,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'margin', _1: '40px 0'},
					_1: {ctor: '[]'}
				}),
			_1: {ctor: '[]'}
		},
		A2(
			_elm_lang$core$Basics_ops['++'],
			_rtfeldman$html_test_runner$Test_Runner_Html$viewLabels(_p4._0),
			A2(_elm_lang$core$List$filterMap, _rtfeldman$html_test_runner$Test_Runner_Html$viewFailure, _p4._1)));
};
var _rtfeldman$html_test_runner$Test_Runner_Html$view = function (model) {
	var failures = A2(
		_elm_lang$core$List$filter,
		function (_p5) {
			return A2(
				_elm_lang$core$List$any,
				F2(
					function (x, y) {
						return !_elm_lang$core$Native_Utils.eq(x, y);
					})(_elm_community$elm_test$Expect$pass),
				_elm_lang$core$Tuple$second(_p5));
		},
		model.completed);
	var remainingCount = _elm_lang$core$List$length(
		_elm_lang$core$Dict$keys(model.available));
	var completedCount = _elm_lang$core$List$length(model.completed);
	var summary = function () {
		var _p6 = model.finishTime;
		if (_p6.ctor === 'Just') {
			var duration = _rtfeldman$html_test_runner$Test_Runner_Html$formatDuration(_p6._0 - model.startTime);
			var thStyle = {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 'text-align', _1: 'left'},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'padding-right', _1: '10px'},
					_1: {ctor: '[]'}
				}
			};
			var _p7 = _elm_lang$core$List$isEmpty(failures) ? {ctor: '_Tuple2', _0: 'darkgreen', _1: 'Test Run Passed'} : {ctor: '_Tuple2', _0: 'hsla(3, 100%, 40%, 1.0)', _1: 'Test Run Failed'};
			var headlineColor = _p7._0;
			var headlineText = _p7._1;
			return A2(
				_elm_lang$html$Html$div,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$h2,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$style(
								{
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'color', _1: headlineColor},
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text(headlineText),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$table,
							{ctor: '[]'},
							{
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$tbody,
									{ctor: '[]'},
									{
										ctor: '::',
										_0: A2(
											_elm_lang$html$Html$tr,
											{ctor: '[]'},
											{
												ctor: '::',
												_0: A2(
													_elm_lang$html$Html$th,
													{
														ctor: '::',
														_0: _elm_lang$html$Html_Attributes$style(thStyle),
														_1: {ctor: '[]'}
													},
													{
														ctor: '::',
														_0: _elm_lang$html$Html$text('Duration'),
														_1: {ctor: '[]'}
													}),
												_1: {
													ctor: '::',
													_0: A2(
														_elm_lang$html$Html$td,
														{ctor: '[]'},
														{
															ctor: '::',
															_0: _elm_lang$html$Html$text(duration),
															_1: {ctor: '[]'}
														}),
													_1: {ctor: '[]'}
												}
											}),
										_1: {
											ctor: '::',
											_0: A2(
												_elm_lang$html$Html$tr,
												{ctor: '[]'},
												{
													ctor: '::',
													_0: A2(
														_elm_lang$html$Html$th,
														{
															ctor: '::',
															_0: _elm_lang$html$Html_Attributes$style(thStyle),
															_1: {ctor: '[]'}
														},
														{
															ctor: '::',
															_0: _elm_lang$html$Html$text('Passed'),
															_1: {ctor: '[]'}
														}),
													_1: {
														ctor: '::',
														_0: A2(
															_elm_lang$html$Html$td,
															{ctor: '[]'},
															{
																ctor: '::',
																_0: _elm_lang$html$Html$text(
																	_elm_lang$core$Basics$toString(
																		completedCount - _elm_lang$core$List$length(failures))),
																_1: {ctor: '[]'}
															}),
														_1: {ctor: '[]'}
													}
												}),
											_1: {
												ctor: '::',
												_0: A2(
													_elm_lang$html$Html$tr,
													{ctor: '[]'},
													{
														ctor: '::',
														_0: A2(
															_elm_lang$html$Html$th,
															{
																ctor: '::',
																_0: _elm_lang$html$Html_Attributes$style(thStyle),
																_1: {ctor: '[]'}
															},
															{
																ctor: '::',
																_0: _elm_lang$html$Html$text('Failed'),
																_1: {ctor: '[]'}
															}),
														_1: {
															ctor: '::',
															_0: A2(
																_elm_lang$html$Html$td,
																{ctor: '[]'},
																{
																	ctor: '::',
																	_0: _elm_lang$html$Html$text(
																		_elm_lang$core$Basics$toString(
																			_elm_lang$core$List$length(failures))),
																	_1: {ctor: '[]'}
																}),
															_1: {ctor: '[]'}
														}
													}),
												_1: {ctor: '[]'}
											}
										}
									}),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				});
		} else {
			return A2(
				_elm_lang$html$Html$div,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$h2,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text('Running Tests...'),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$div,
							{ctor: '[]'},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text(
									A2(
										_elm_lang$core$Basics_ops['++'],
										_elm_lang$core$Basics$toString(completedCount),
										' completed')),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$div,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text(
										A2(
											_elm_lang$core$Basics_ops['++'],
											_elm_lang$core$Basics$toString(remainingCount),
											' remaining')),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}
				});
		}
	}();
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'width', _1: '960px'},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'margin', _1: 'auto 40px'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'font-family', _1: 'verdana, sans-serif'},
							_1: {ctor: '[]'}
						}
					}
				}),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: summary,
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$ol,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('results'),
						_1: {
							ctor: '::',
							_0: _rtfeldman$html_test_runner$Test_Runner_Html$resultsStyle,
							_1: {ctor: '[]'}
						}
					},
					A2(_elm_lang$core$List$map, _rtfeldman$html_test_runner$Test_Runner_Html$viewFailures, failures)),
				_1: {ctor: '[]'}
			}
		});
};
var _rtfeldman$html_test_runner$Test_Runner_Html$Model = F6(
	function (a, b, c, d, e, f) {
		return {available: a, running: b, queue: c, completed: d, startTime: e, finishTime: f};
	});
var _rtfeldman$html_test_runner$Test_Runner_Html$Finish = function (a) {
	return {ctor: 'Finish', _0: a};
};
var _rtfeldman$html_test_runner$Test_Runner_Html$Dispatch = {ctor: 'Dispatch'};
var _rtfeldman$html_test_runner$Test_Runner_Html$dispatch = A2(
	_elm_lang$core$Task$perform,
	_elm_lang$core$Basics$identity,
	_elm_lang$core$Task$succeed(_rtfeldman$html_test_runner$Test_Runner_Html$Dispatch));
var _rtfeldman$html_test_runner$Test_Runner_Html$update = F2(
	function (msg, model) {
		var _p8 = msg;
		if (_p8.ctor === 'Finish') {
			var _p9 = model.finishTime;
			if (_p9.ctor === 'Nothing') {
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							finishTime: _elm_lang$core$Maybe$Just(_p8._0)
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			} else {
				return A2(
					_rtfeldman$html_test_runner$Test_Runner_Html$warn,
					'Attempted to Finish more than once!',
					{ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none});
			}
		} else {
			var _p10 = model.queue;
			if (_p10.ctor === '[]') {
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: A2(_elm_lang$core$Task$perform, _rtfeldman$html_test_runner$Test_Runner_Html$Finish, _elm_lang$core$Time$now)
				};
			} else {
				var _p12 = _p10._0;
				var _p11 = A2(_elm_lang$core$Dict$get, _p12, model.available);
				if (_p11.ctor === 'Nothing') {
					return A2(
						_rtfeldman$html_test_runner$Test_Runner_Html$warn,
						A2(
							_elm_lang$core$Basics_ops['++'],
							'Could not find testId ',
							_elm_lang$core$Basics$toString(_p12)),
						{ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none});
				} else {
					var available = A2(_elm_lang$core$Dict$remove, _p12, model.available);
					var completed = A2(
						_elm_lang$core$Basics_ops['++'],
						model.completed,
						{
							ctor: '::',
							_0: _p11._0(
								{ctor: '_Tuple0'}),
							_1: {ctor: '[]'}
						});
					var newModel = _elm_lang$core$Native_Utils.update(
						model,
						{completed: completed, available: available, queue: _p10._1});
					return {ctor: '_Tuple2', _0: newModel, _1: _rtfeldman$html_test_runner$Test_Runner_Html$dispatch};
				}
			}
		}
	});
var _rtfeldman$html_test_runner$Test_Runner_Html$init = F2(
	function (startTime, thunks) {
		var indexedThunks = A2(
			_elm_lang$core$List$indexedMap,
			F2(
				function (v0, v1) {
					return {ctor: '_Tuple2', _0: v0, _1: v1};
				}),
			thunks);
		var model = {
			available: _elm_lang$core$Dict$fromList(indexedThunks),
			running: _elm_lang$core$Set$empty,
			queue: A2(_elm_lang$core$List$map, _elm_lang$core$Tuple$first, indexedThunks),
			completed: {ctor: '[]'},
			startTime: startTime,
			finishTime: _elm_lang$core$Maybe$Nothing
		};
		return {ctor: '_Tuple2', _0: model, _1: _rtfeldman$html_test_runner$Test_Runner_Html$dispatch};
	});
var _rtfeldman$html_test_runner$Test_Runner_Html$runWithOptions = F2(
	function (runs, seed) {
		return A2(
			_rtfeldman$html_test_runner$Test_Runner_Html_App$run,
			{runs: runs, seed: seed},
			{
				init: _rtfeldman$html_test_runner$Test_Runner_Html$init,
				update: _rtfeldman$html_test_runner$Test_Runner_Html$update,
				view: _rtfeldman$html_test_runner$Test_Runner_Html$view,
				subscriptions: function (_p13) {
					return _elm_lang$core$Platform_Sub$none;
				}
			});
	});
var _rtfeldman$html_test_runner$Test_Runner_Html$run = A2(_rtfeldman$html_test_runner$Test_Runner_Html$runWithOptions, _elm_lang$core$Maybe$Nothing, _elm_lang$core$Maybe$Nothing);

var _rtfeldman$legacy_elm_test$Legacy_StringRunner$indentLines = function (str) {
	return A2(
		_elm_lang$core$String$join,
		'\n',
		A2(
			_elm_lang$core$List$map,
			F2(
				function (x, y) {
					return A2(_elm_lang$core$Basics_ops['++'], x, y);
				})('    '),
			A2(_elm_lang$core$String$split, '\n', str)));
};
var _rtfeldman$legacy_elm_test$Legacy_StringRunner$defaultRuns = 100;
var _rtfeldman$legacy_elm_test$Legacy_StringRunner$defaultSeed = _mgold$elm_random_pcg$Random_Pcg$initialSeed(4295183);
var _rtfeldman$legacy_elm_test$Legacy_StringRunner$outputLabels = function (labels) {
	return A2(
		_elm_lang$core$String$join,
		'\n',
		A3(
			_elm_community$elm_test$Test_Runner$formatLabels,
			F2(
				function (x, y) {
					return A2(_elm_lang$core$Basics_ops['++'], x, y);
				})('↓ '),
			F2(
				function (x, y) {
					return A2(_elm_lang$core$Basics_ops['++'], x, y);
				})('✗ '),
			labels));
};
var _rtfeldman$legacy_elm_test$Legacy_StringRunner$fromExpectation = F2(
	function (expectation, summary) {
		var _p0 = _elm_community$elm_test$Expect$getFailure(expectation);
		if (_p0.ctor === 'Nothing') {
			return _elm_lang$core$Native_Utils.update(
				summary,
				{passed: summary.passed + 1});
		} else {
			var _p1 = _p0._0.given;
			var prefix = _elm_lang$core$String$isEmpty(_p1) ? '' : A2(
				_elm_lang$core$Basics_ops['++'],
				'Given ',
				A2(_elm_lang$core$Basics_ops['++'], _p1, '\n\n'));
			var newOutput = A2(
				_elm_lang$core$Basics_ops['++'],
				'\n\n',
				A2(
					_elm_lang$core$Basics_ops['++'],
					A2(
						_elm_lang$core$Basics_ops['++'],
						prefix,
						_rtfeldman$legacy_elm_test$Legacy_StringRunner$indentLines(_p0._0.message)),
					'\n'));
			return {
				output: A2(_elm_lang$core$Basics_ops['++'], summary.output, newOutput),
				failed: summary.failed + 1,
				passed: summary.passed
			};
		}
	});
var _rtfeldman$legacy_elm_test$Legacy_StringRunner$toOutputHelp = F3(
	function (labels, runner, summary) {
		toOutputHelp:
		while (true) {
			var _p2 = runner;
			switch (_p2.ctor) {
				case 'Runnable':
					return A3(
						_elm_lang$core$List$foldl,
						_rtfeldman$legacy_elm_test$Legacy_StringRunner$fromExpectation,
						summary,
						_elm_community$elm_test$Test_Runner$run(_p2._0));
				case 'Labeled':
					var _v2 = {ctor: '::', _0: _p2._0, _1: labels},
						_v3 = _p2._1,
						_v4 = summary;
					labels = _v2;
					runner = _v3;
					summary = _v4;
					continue toOutputHelp;
				default:
					return A3(
						_elm_lang$core$List$foldl,
						_rtfeldman$legacy_elm_test$Legacy_StringRunner$toOutputHelp(labels),
						summary,
						_p2._0);
			}
		}
	});
var _rtfeldman$legacy_elm_test$Legacy_StringRunner$toOutput = _elm_lang$core$Basics$flip(
	_rtfeldman$legacy_elm_test$Legacy_StringRunner$toOutputHelp(
		{ctor: '[]'}));
var _rtfeldman$legacy_elm_test$Legacy_StringRunner$runWithOptions = F3(
	function (runs, seed, test) {
		return A2(
			_rtfeldman$legacy_elm_test$Legacy_StringRunner$toOutput,
			{output: '', passed: 0, failed: 0},
			A3(_elm_community$elm_test$Test_Runner$fromTest, runs, seed, test));
	});
var _rtfeldman$legacy_elm_test$Legacy_StringRunner$run = A2(_rtfeldman$legacy_elm_test$Legacy_StringRunner$runWithOptions, _rtfeldman$legacy_elm_test$Legacy_StringRunner$defaultRuns, _rtfeldman$legacy_elm_test$Legacy_StringRunner$defaultSeed);
var _rtfeldman$legacy_elm_test$Legacy_StringRunner$Summary = F3(
	function (a, b, c) {
		return {output: a, passed: b, failed: c};
	});

var _rtfeldman$legacy_elm_test$Legacy_LogRunner$summarize = function (_p0) {
	var _p1 = _p0;
	var _p3 = _p1.output;
	var _p2 = _p1.failed;
	var headline = (_elm_lang$core$Native_Utils.cmp(_p2, 0) > 0) ? A2(_elm_lang$core$Basics_ops['++'], _p3, '\n\nTEST RUN FAILED') : 'TEST RUN PASSED';
	return A2(
		_elm_lang$core$String$join,
		'\n',
		{
			ctor: '::',
			_0: _p3,
			_1: {
				ctor: '::',
				_0: A2(_elm_lang$core$Basics_ops['++'], headline, '\n'),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$core$Basics_ops['++'],
						'Passed: ',
						_elm_lang$core$Basics$toString(_p1.passed)),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$core$Basics_ops['++'],
							'Failed: ',
							_elm_lang$core$Basics$toString(_p2)),
						_1: {ctor: '[]'}
					}
				}
			}
		});
};
var _rtfeldman$legacy_elm_test$Legacy_LogRunner$logOutput = F2(
	function (summary, arg) {
		var output = A2(
			_elm_lang$core$Basics_ops['++'],
			_rtfeldman$legacy_elm_test$Legacy_LogRunner$summarize(summary),
			'\n\nExit code');
		var _p4 = (_elm_lang$core$Native_Utils.cmp(summary.failed, 0) > 0) ? function (_p5) {
			return {ctor: '_Tuple0'};
		}(
			function (_p6) {
				return _elm_lang$core$Native_Utils.crash(
					'Legacy.LogRunner',
					{
						start: {line: 69, column: 31},
						end: {line: 69, column: 42}
					})('FAILED TEST RUN');
			}(
				A3(_elm_lang$core$Basics$flip, _elm_lang$core$Debug$log, 1, output))) : function (_p7) {
			return {ctor: '_Tuple0'};
		}(
			A3(_elm_lang$core$Basics$flip, _elm_lang$core$Debug$log, 0, output));
		return arg;
	});
var _rtfeldman$legacy_elm_test$Legacy_LogRunner$runWithOptions = F3(
	function (runs, seed, test) {
		return _rtfeldman$legacy_elm_test$Legacy_LogRunner$logOutput(
			A3(_rtfeldman$legacy_elm_test$Legacy_StringRunner$runWithOptions, runs, seed, test));
	});
var _rtfeldman$legacy_elm_test$Legacy_LogRunner$run = function (test) {
	return _rtfeldman$legacy_elm_test$Legacy_LogRunner$logOutput(
		_rtfeldman$legacy_elm_test$Legacy_StringRunner$run(test));
};

var _rtfeldman$legacy_elm_test$Legacy_ElmTest$runSuiteHtml = _rtfeldman$html_test_runner$Test_Runner_Html$run;
var _rtfeldman$legacy_elm_test$Legacy_ElmTest$runSuite = function (test) {
	return A2(
		_rtfeldman$legacy_elm_test$Legacy_LogRunner$run,
		test,
		_elm_lang$html$Html$beginnerProgram(
			{
				model: {ctor: '_Tuple0'},
				update: F2(
					function (_p1, _p0) {
						return {ctor: '_Tuple0'};
					}),
				view: function (_p2) {
					return _elm_lang$html$Html$text('Check the console for useful output!');
				}
			}));
};
var _rtfeldman$legacy_elm_test$Legacy_ElmTest$stringRunner = function (test) {
	return _rtfeldman$legacy_elm_test$Legacy_StringRunner$run(test).output;
};
var _rtfeldman$legacy_elm_test$Legacy_ElmTest$fail = _elm_community$elm_test$Expect$fail;
var _rtfeldman$legacy_elm_test$Legacy_ElmTest$pass = _elm_community$elm_test$Expect$pass;
var _rtfeldman$legacy_elm_test$Legacy_ElmTest$lazyAssert = function (fn) {
	return A2(
		_elm_community$elm_test$Expect$true,
		'lazyAssert assertion failed',
		fn(
			{ctor: '_Tuple0'}));
};
var _rtfeldman$legacy_elm_test$Legacy_ElmTest$assertNotEqual = _elm_community$elm_test$Expect$notEqual;
var _rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual = _elm_community$elm_test$Expect$equal;
var _rtfeldman$legacy_elm_test$Legacy_ElmTest$assertionList = F2(
	function (first, second) {
		return A3(_elm_lang$core$List$map2, _rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual, first, second);
	});
var _rtfeldman$legacy_elm_test$Legacy_ElmTest$assert = function (condition) {
	return condition ? _elm_community$elm_test$Expect$pass : _elm_community$elm_test$Expect$fail('Assertion failed');
};
var _rtfeldman$legacy_elm_test$Legacy_ElmTest$suite = _elm_community$elm_test$Test$describe;
var _rtfeldman$legacy_elm_test$Legacy_ElmTest$defaultTest = function (assertion) {
	return A2(
		_elm_community$elm_test$Test$test,
		'',
		function (_p3) {
			return assertion;
		});
};
var _rtfeldman$legacy_elm_test$Legacy_ElmTest$equals = F2(
	function (expected, actual) {
		return _rtfeldman$legacy_elm_test$Legacy_ElmTest$defaultTest(
			A2(_elm_community$elm_test$Expect$equal, expected, actual));
	});
var _rtfeldman$legacy_elm_test$Legacy_ElmTest$test = F2(
	function (desc, outcome) {
		return A2(
			_elm_community$elm_test$Test$test,
			desc,
			function (_p4) {
				return outcome;
			});
	});

var _user$project$Parser_Tokenizer$consumeToken = F2(
	function (_p0, s) {
		var _p1 = _p0;
		var regexString_ = A2(_elm_lang$core$Basics_ops['++'], '^', _p1._1);
		var regex_ = _elm_lang$core$Regex$regex(regexString_);
		var _p2 = A3(
			_elm_lang$core$Regex$find,
			_elm_lang$core$Regex$AtMost(1),
			regex_,
			s);
		if (_p2.ctor === '[]') {
			return _elm_lang$core$Maybe$Nothing;
		} else {
			var remainder = A4(
				_elm_lang$core$Regex$replace,
				_elm_lang$core$Regex$AtMost(1),
				regex_,
				function (_p3) {
					return '';
				},
				s);
			var token = {ctor: '_Tuple2', _0: _p1._0, _1: _p2._0.match};
			return _elm_lang$core$Maybe$Just(
				{ctor: '_Tuple2', _0: token, _1: remainder});
		}
	});
var _user$project$Parser_Tokenizer$consumeFirstTokenMatch = F2(
	function (tokenRecipes, s) {
		consumeFirstTokenMatch:
		while (true) {
			var _p4 = tokenRecipes;
			if (_p4.ctor === '[]') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p5 = A2(_user$project$Parser_Tokenizer$consumeToken, _p4._0, s);
				if (_p5.ctor === 'Nothing') {
					var _v4 = _p4._1,
						_v5 = s;
					tokenRecipes = _v4;
					s = _v5;
					continue consumeFirstTokenMatch;
				} else {
					return _elm_lang$core$Maybe$Just(_p5._0);
				}
			}
		}
	});
var _user$project$Parser_Tokenizer$doubleQuotedStringRegex = function () {
	var reservedChars = '\"';
	return '\n        [^\\\"]+\n        ';
}();
var _user$project$Parser_Tokenizer$Word = {ctor: 'Word'};
var _user$project$Parser_Tokenizer$Whitespace = {ctor: 'Whitespace'};
var _user$project$Parser_Tokenizer$Dash = {ctor: 'Dash'};
var _user$project$Parser_Tokenizer$ExclamationMark = {ctor: 'ExclamationMark'};
var _user$project$Parser_Tokenizer$ForwardSlash = {ctor: 'ForwardSlash'};
var _user$project$Parser_Tokenizer$SingleQuotationMark = {ctor: 'SingleQuotationMark'};
var _user$project$Parser_Tokenizer$DoubleQuotationMark = {ctor: 'DoubleQuotationMark'};
var _user$project$Parser_Tokenizer$EqualsSign = {ctor: 'EqualsSign'};
var _user$project$Parser_Tokenizer$RightAngleBracket = {ctor: 'RightAngleBracket'};
var _user$project$Parser_Tokenizer$LeftAngleBracket = {ctor: 'LeftAngleBracket'};
var _user$project$Parser_Tokenizer$reservedCharTokenLookup = {
	ctor: '::',
	_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$LeftAngleBracket, _1: '<'},
	_1: {
		ctor: '::',
		_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$LeftAngleBracket, _1: '<'},
		_1: {
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$RightAngleBracket, _1: '>'},
			_1: {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$EqualsSign, _1: '='},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$DoubleQuotationMark, _1: '\"'},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$SingleQuotationMark, _1: '\''},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$ForwardSlash, _1: '/'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$Dash, _1: '-'},
								_1: {ctor: '[]'}
							}
						}
					}
				}
			}
		}
	}
};
var _user$project$Parser_Tokenizer$wordRegex = function () {
	var reservedChars = A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p6, s) {
				var _p7 = _p6;
				return A2(_elm_lang$core$Basics_ops['++'], s, _p7._1);
			}),
		'',
		_user$project$Parser_Tokenizer$reservedCharTokenLookup);
	return A2(
		_elm_lang$core$Basics_ops['++'],
		'[^',
		A2(_elm_lang$core$Basics_ops['++'], reservedChars, '\\s]+'));
}();
var _user$project$Parser_Tokenizer$wildcards = {
	ctor: '::',
	_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$Whitespace, _1: '(\\s)+'},
	_1: {
		ctor: '::',
		_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$Word, _1: _user$project$Parser_Tokenizer$wordRegex},
		_1: {ctor: '[]'}
	}
};
var _user$project$Parser_Tokenizer$ClosingComment = {ctor: 'ClosingComment'};
var _user$project$Parser_Tokenizer$OpeningComment = {ctor: 'OpeningComment'};
var _user$project$Parser_Tokenizer$specialSequences = {
	ctor: '::',
	_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$OpeningComment, _1: '<!--'},
	_1: {
		ctor: '::',
		_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$ClosingComment, _1: '-->'},
		_1: {ctor: '[]'}
	}
};
var _user$project$Parser_Tokenizer$tokenizerGrammar = A2(
	_elm_lang$core$Basics_ops['++'],
	_user$project$Parser_Tokenizer$specialSequences,
	A2(_elm_lang$core$Basics_ops['++'], _user$project$Parser_Tokenizer$reservedCharTokenLookup, _user$project$Parser_Tokenizer$wildcards));
var _user$project$Parser_Tokenizer$tokenize = function (s) {
	var tokenize_ = F2(
		function (accTokens, remainderString) {
			tokenize_:
			while (true) {
				var _p8 = A2(_user$project$Parser_Tokenizer$consumeFirstTokenMatch, _user$project$Parser_Tokenizer$tokenizerGrammar, remainderString);
				if (_p8.ctor === 'Nothing') {
					return accTokens;
				} else {
					var _v8 = A2(
						_elm_lang$core$Basics_ops['++'],
						accTokens,
						{
							ctor: '::',
							_0: _p8._0._0,
							_1: {ctor: '[]'}
						}),
						_v9 = _p8._0._1;
					accTokens = _v8;
					remainderString = _v9;
					continue tokenize_;
				}
			}
		});
	return A2(
		tokenize_,
		{ctor: '[]'},
		s);
};
var _user$project$Parser_Tokenizer$tests = A2(
	_rtfeldman$legacy_elm_test$Legacy_ElmTest$suite,
	'Tokenizer.elm',
	{
		ctor: '::',
		_0: A2(
			_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
			'consumeToken',
			A2(
				_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
				_elm_lang$core$Maybe$Just(
					{
						ctor: '_Tuple2',
						_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$ExclamationMark, _1: '!'},
						_1: 'hello'
					}),
				A2(
					_user$project$Parser_Tokenizer$consumeToken,
					{ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$ExclamationMark, _1: '!'},
					'!hello'))),
		_1: {
			ctor: '::',
			_0: A2(
				_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
				'consumeWhitespace',
				A2(
					_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
					_elm_lang$core$Maybe$Just(
						{
							ctor: '_Tuple2',
							_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$Whitespace, _1: '   '},
							_1: 'hello'
						}),
					A2(
						_user$project$Parser_Tokenizer$consumeToken,
						{ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$Whitespace, _1: '(\\s)+'},
						'   hello'))),
			_1: {
				ctor: '::',
				_0: A2(
					_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
					'consumeFirstTokenMatch (!)',
					A2(
						_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
						_elm_lang$core$Maybe$Just(
							{
								ctor: '_Tuple2',
								_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$OpeningComment, _1: '<!--'},
								_1: ' hello'
							}),
						A2(_user$project$Parser_Tokenizer$consumeFirstTokenMatch, _user$project$Parser_Tokenizer$tokenizerGrammar, '<!-- hello'))),
				_1: {
					ctor: '::',
					_0: A2(
						_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
						'consumeWhitespace',
						A2(
							_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
							_elm_lang$core$Maybe$Just(
								{
									ctor: '_Tuple2',
									_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$Whitespace, _1: '   '},
									_1: 'hello'
								}),
							A2(_user$project$Parser_Tokenizer$consumeFirstTokenMatch, _user$project$Parser_Tokenizer$tokenizerGrammar, '   hello'))),
					_1: {
						ctor: '::',
						_0: A2(
							_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
							'consumeWord',
							A2(
								_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
								_elm_lang$core$Maybe$Just(
									{
										ctor: '_Tuple2',
										_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$Word, _1: 'one'},
										_1: '>two'
									}),
								A2(_user$project$Parser_Tokenizer$consumeFirstTokenMatch, _user$project$Parser_Tokenizer$tokenizerGrammar, 'one>two'))),
						_1: {ctor: '[]'}
					}
				}
			}
		}
	});
var _user$project$Parser_Tokenizer$main = _rtfeldman$legacy_elm_test$Legacy_ElmTest$runSuiteHtml(_user$project$Parser_Tokenizer$tests)();

var _user$project$Parser_Parser$testTokens = {
	ctor: '::',
	_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$LeftAngleBracket, _1: '<'},
	_1: {ctor: '[]'}
};
var _user$project$Parser_Parser$AstNodeRecord = F2(
	function (a, b) {
		return {label: a, value: b};
	});
var _user$project$Parser_Parser$UnlabelledAstNode = function (a) {
	return {ctor: 'UnlabelledAstNode', _0: a};
};
var _user$project$Parser_Parser$LabelledAstNode = function (a) {
	return {ctor: 'LabelledAstNode', _0: a};
};
var _user$project$Parser_Parser$AstChildren = function (a) {
	return {ctor: 'AstChildren', _0: a};
};
var _user$project$Parser_Parser$AstLeaf = function (a) {
	return {ctor: 'AstLeaf', _0: a};
};
var _user$project$Parser_Parser$TokenDoesNotMatch = function (a) {
	return {ctor: 'TokenDoesNotMatch', _0: a};
};
var _user$project$Parser_Parser$TokenMatches = function (a) {
	return {ctor: 'TokenMatches', _0: a};
};
var _user$project$Parser_Parser$consumeToken = F2(
	function (expectedTokenType, tokens) {
		var _p0 = tokens;
		if (_p0.ctor === '::') {
			return _elm_lang$core$Native_Utils.eq(_p0._0._0, expectedTokenType) ? _user$project$Parser_Parser$TokenMatches(
				{ctor: '_Tuple2', _0: _p0._0._1, _1: _p0._1}) : _user$project$Parser_Parser$TokenDoesNotMatch(tokens);
		} else {
			return _user$project$Parser_Parser$TokenDoesNotMatch(tokens);
		}
	});
var _user$project$Parser_Parser$ParseDoesNotMatch = {ctor: 'ParseDoesNotMatch'};
var _user$project$Parser_Parser$ParseMatchesReturnsNothing = {ctor: 'ParseMatchesReturnsNothing'};
var _user$project$Parser_Parser$createParseTokenIgnoreFunction = function (tokenType) {
	var parseTokenIgnore = function (tokens) {
		var _p1 = A2(_user$project$Parser_Parser$consumeToken, tokenType, tokens);
		if (_p1.ctor === 'TokenMatches') {
			return {ctor: '_Tuple2', _0: _user$project$Parser_Parser$ParseMatchesReturnsNothing, _1: _p1._0._1};
		} else {
			return {ctor: '_Tuple2', _0: _user$project$Parser_Parser$ParseDoesNotMatch, _1: tokens};
		}
	};
	return parseTokenIgnore;
};
var _user$project$Parser_Parser$parseLeftAngleBracket = _user$project$Parser_Parser$createParseTokenIgnoreFunction(_user$project$Parser_Tokenizer$LeftAngleBracket);
var _user$project$Parser_Parser$parseRightAngleBracket = _user$project$Parser_Parser$createParseTokenIgnoreFunction(_user$project$Parser_Tokenizer$RightAngleBracket);
var _user$project$Parser_Parser$parseRightAngleBracketKeep = _user$project$Parser_Parser$createParseTokenIgnoreFunction(_user$project$Parser_Tokenizer$RightAngleBracket);
var _user$project$Parser_Parser$ignore = function (parseFunction) {
	var f = function (tokens) {
		var _p2 = parseFunction(tokens);
		if ((_p2.ctor === '_Tuple2') && (_p2._0.ctor === 'ParseMatchesReturnsResult')) {
			return {ctor: '_Tuple2', _0: _user$project$Parser_Parser$ParseMatchesReturnsNothing, _1: _p2._1};
		} else {
			return _p2;
		}
	};
	return f;
};
var _user$project$Parser_Parser$optional = function (parseFunction) {
	var f = function (tokens) {
		var _p3 = parseFunction(tokens);
		if ((_p3.ctor === '_Tuple2') && (_p3._0.ctor === 'ParseDoesNotMatch')) {
			return {ctor: '_Tuple2', _0: _user$project$Parser_Parser$ParseMatchesReturnsNothing, _1: _p3._1};
		} else {
			return _p3;
		}
	};
	return f;
};
var _user$project$Parser_Parser$ParseMatchesReturnsResult = function (a) {
	return {ctor: 'ParseMatchesReturnsResult', _0: a};
};
var _user$project$Parser_Parser$createParseTokenKeepFunction = function (tokenType) {
	var parseTokenKeep = function (tokens) {
		var _p4 = A2(_user$project$Parser_Parser$consumeToken, tokenType, tokens);
		if (_p4.ctor === 'TokenMatches') {
			return {
				ctor: '_Tuple2',
				_0: _user$project$Parser_Parser$ParseMatchesReturnsResult(
					_user$project$Parser_Parser$UnlabelledAstNode(
						_user$project$Parser_Parser$AstLeaf(_p4._0._0))),
				_1: _p4._0._1
			};
		} else {
			return {ctor: '_Tuple2', _0: _user$project$Parser_Parser$ParseDoesNotMatch, _1: tokens};
		}
	};
	return parseTokenKeep;
};
var _user$project$Parser_Parser$parseLeftAngleBracketKeep = _user$project$Parser_Parser$createParseTokenKeepFunction(_user$project$Parser_Tokenizer$LeftAngleBracket);
var _user$project$Parser_Parser$parseWordKeep = _user$project$Parser_Parser$createParseTokenKeepFunction(_user$project$Parser_Tokenizer$Word);
var _user$project$Parser_Parser$labelled = F2(
	function (label, parseFunction) {
		var parseFunction_ = function (tokens) {
			var result = parseFunction(tokens);
			var _p5 = result;
			if (((_p5.ctor === '_Tuple2') && (_p5._0.ctor === 'ParseMatchesReturnsResult')) && (_p5._0._0.ctor === 'UnlabelledAstNode')) {
				return {
					ctor: '_Tuple2',
					_0: _user$project$Parser_Parser$ParseMatchesReturnsResult(
						_user$project$Parser_Parser$LabelledAstNode(
							{label: label, value: _p5._0._0._0})),
					_1: _p5._1
				};
			} else {
				return result;
			}
		};
		return parseFunction_;
	});
var _user$project$Parser_Parser$createParseAnyFunction = function (parseFunctions) {
	var parseAny = F2(
		function (parseFunctions, tokens) {
			parseAny:
			while (true) {
				var _p6 = parseFunctions;
				if (_p6.ctor === '[]') {
					return {ctor: '_Tuple2', _0: _user$project$Parser_Parser$ParseDoesNotMatch, _1: tokens};
				} else {
					var _p7 = _p6._0(tokens);
					switch (_p7._0.ctor) {
						case 'ParseDoesNotMatch':
							var _v8 = _p6._1,
								_v9 = tokens;
							parseFunctions = _v8;
							tokens = _v9;
							continue parseAny;
						case 'ParseMatchesReturnsNothing':
							return {ctor: '_Tuple2', _0: _user$project$Parser_Parser$ParseMatchesReturnsNothing, _1: _p7._1};
						default:
							return {
								ctor: '_Tuple2',
								_0: _user$project$Parser_Parser$ParseMatchesReturnsResult(_p7._0._0),
								_1: _p7._1
							};
					}
				}
			}
		});
	var parseAny_ = function (tokens) {
		return A2(parseAny, parseFunctions, tokens);
	};
	return parseAny_;
};
var _user$project$Parser_Parser$createOptionallyParseMultipleFunction = function (repeatedParseFunction) {
	var parseMultiple__ = F2(
		function (accAstNodes, remainderTokens) {
			parseMultiple__:
			while (true) {
				var _p8 = repeatedParseFunction(remainderTokens);
				switch (_p8._0.ctor) {
					case 'ParseMatchesReturnsResult':
						var _v11 = A2(
							_elm_lang$core$Basics_ops['++'],
							accAstNodes,
							{
								ctor: '::',
								_0: _p8._0._0,
								_1: {ctor: '[]'}
							}),
							_v12 = _p8._1;
						accAstNodes = _v11;
						remainderTokens = _v12;
						continue parseMultiple__;
					case 'ParseMatchesReturnsNothing':
						var _v13 = accAstNodes,
							_v14 = _p8._1;
						accAstNodes = _v13;
						remainderTokens = _v14;
						continue parseMultiple__;
					default:
						return {ctor: '_Tuple2', _0: accAstNodes, _1: _p8._1};
				}
			}
		});
	var parseMultiple_ = function (tokens) {
		var _p9 = tokens;
		if (_p9.ctor === '[]') {
			return {
				ctor: '_Tuple2',
				_0: _user$project$Parser_Parser$ParseMatchesReturnsResult(
					_user$project$Parser_Parser$UnlabelledAstNode(
						_user$project$Parser_Parser$AstChildren(
							{ctor: '[]'}))),
				_1: tokens
			};
		} else {
			var _p10 = A2(
				parseMultiple__,
				{ctor: '[]'},
				tokens);
			var astNodes = _p10._0;
			var remainderTokens = _p10._1;
			return {
				ctor: '_Tuple2',
				_0: _user$project$Parser_Parser$ParseMatchesReturnsResult(
					_user$project$Parser_Parser$UnlabelledAstNode(
						_user$project$Parser_Parser$AstChildren(astNodes))),
				_1: remainderTokens
			};
		}
	};
	return parseMultiple_;
};
var _user$project$Parser_Parser$createParseSequenceFunction = function (parseFunctions) {
	var parseSequence = function (tokens) {
		var parseSequence_ = F3(
			function (remainderParseFunctions, accAstNodes, remainderTokens) {
				parseSequence_:
				while (true) {
					var _p11 = remainderParseFunctions;
					if (_p11.ctor === '[]') {
						return {
							ctor: '_Tuple2',
							_0: _user$project$Parser_Parser$ParseMatchesReturnsResult(
								_user$project$Parser_Parser$UnlabelledAstNode(
									_user$project$Parser_Parser$AstChildren(accAstNodes))),
							_1: remainderTokens
						};
					} else {
						var _p13 = _p11._1;
						var _p12 = _p11._0(remainderTokens);
						switch (_p12._0.ctor) {
							case 'ParseMatchesReturnsNothing':
								var _v18 = _p13,
									_v19 = accAstNodes,
									_v20 = _p12._1;
								remainderParseFunctions = _v18;
								accAstNodes = _v19;
								remainderTokens = _v20;
								continue parseSequence_;
							case 'ParseMatchesReturnsResult':
								var _v21 = _p13,
									_v22 = A2(
									_elm_lang$core$Basics_ops['++'],
									accAstNodes,
									{
										ctor: '::',
										_0: _p12._0._0,
										_1: {ctor: '[]'}
									}),
									_v23 = _p12._1;
								remainderParseFunctions = _v21;
								accAstNodes = _v22;
								remainderTokens = _v23;
								continue parseSequence_;
							default:
								return {ctor: '_Tuple2', _0: _user$project$Parser_Parser$ParseDoesNotMatch, _1: tokens};
						}
					}
				}
			});
		var _p14 = tokens;
		if (_p14.ctor === '[]') {
			return {
				ctor: '_Tuple2',
				_0: _user$project$Parser_Parser$ParseDoesNotMatch,
				_1: {ctor: '[]'}
			};
		} else {
			return A3(
				parseSequence_,
				parseFunctions,
				{ctor: '[]'},
				tokens);
		}
	};
	return parseSequence;
};
var _user$project$Parser_Parser$createParseAtLeastOneFunction = function (parseFunction) {
	var cleanUpMessyResult = function (messyResult) {
		var _p15 = messyResult;
		if (_p15.ctor === 'ParseMatchesReturnsResult') {
			var split_ = function (children) {
				var _p16 = children;
				if ((_p16.ctor === '::') && (_p16._1.ctor === '::')) {
					return {ctor: '_Tuple2', _0: _p16._0, _1: _p16._1._0};
				} else {
					return _elm_lang$core$Native_Utils.crashCase(
						'Parser.Parser',
						{
							start: {line: 276, column: 29},
							end: {line: 280, column: 52}
						},
						_p16)('');
				}
			};
			var getChildren = function (node) {
				var _p18 = node;
				if (_p18.ctor === 'UnlabelledAstNode') {
					var _p19 = _p18._0;
					if (_p19.ctor === 'AstChildren') {
						return _p19._0;
					} else {
						return _elm_lang$core$Native_Utils.crashCase(
							'Parser.Parser',
							{
								start: {line: 267, column: 37},
								end: {line: 271, column: 60}
							},
							_p19)('');
					}
				} else {
					return _elm_lang$core$Native_Utils.crashCase(
						'Parser.Parser',
						{
							start: {line: 265, column: 29},
							end: {line: 274, column: 52}
						},
						_p18)('');
				}
			};
			var _p22 = split_(
				getChildren(_p15._0));
			var headNode = _p22._0;
			var tailMess = _p22._1;
			var tailNodes = getChildren(tailMess);
			var allNodes = A2(
				_elm_lang$core$Basics_ops['++'],
				{
					ctor: '::',
					_0: headNode,
					_1: {ctor: '[]'}
				},
				tailNodes);
			return _user$project$Parser_Parser$ParseMatchesReturnsResult(
				_user$project$Parser_Parser$UnlabelledAstNode(
					_user$project$Parser_Parser$AstChildren(allNodes)));
		} else {
			return messyResult;
		}
	};
	var sequenceFunction = _user$project$Parser_Parser$createParseSequenceFunction(
		{
			ctor: '::',
			_0: parseFunction,
			_1: {
				ctor: '::',
				_0: _user$project$Parser_Parser$createOptionallyParseMultipleFunction(parseFunction),
				_1: {ctor: '[]'}
			}
		});
	var parseAtLeastOne_ = function (tokens) {
		return sequenceFunction(tokens);
	};
	var parseAtLeastOne = function (tokens) {
		var _p23 = parseAtLeastOne_(tokens);
		var messyResult = _p23._0;
		var remainderTokens = _p23._1;
		return {
			ctor: '_Tuple2',
			_0: cleanUpMessyResult(messyResult),
			_1: remainderTokens
		};
	};
	return parseAtLeastOne;
};
var _user$project$Parser_Parser$tests = A2(
	_rtfeldman$legacy_elm_test$Legacy_ElmTest$suite,
	'Parser.elm',
	{
		ctor: '::',
		_0: A2(
			_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
			'consumeToken with match',
			A2(
				_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
				A2(_user$project$Parser_Parser$consumeToken, _user$project$Parser_Tokenizer$LeftAngleBracket, _user$project$Parser_Parser$testTokens),
				_user$project$Parser_Parser$TokenMatches(
					{
						ctor: '_Tuple2',
						_0: '<',
						_1: {ctor: '[]'}
					}))),
		_1: {
			ctor: '::',
			_0: A2(
				_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
				'consumeToken with match',
				A2(
					_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
					A2(_user$project$Parser_Parser$consumeToken, _user$project$Parser_Tokenizer$LeftAngleBracket, _user$project$Parser_Parser$testTokens),
					_user$project$Parser_Parser$TokenMatches(
						{
							ctor: '_Tuple2',
							_0: '<',
							_1: {ctor: '[]'}
						}))),
			_1: {
				ctor: '::',
				_0: A2(
					_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
					'consumeToken no match',
					A2(
						_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
						A2(_user$project$Parser_Parser$consumeToken, _user$project$Parser_Tokenizer$RightAngleBracket, _user$project$Parser_Parser$testTokens),
						_user$project$Parser_Parser$TokenDoesNotMatch(_user$project$Parser_Parser$testTokens))),
				_1: {
					ctor: '::',
					_0: A2(
						_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
						'createParseTokenIgnoreFunction',
						A2(
							_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
							{
								ctor: '_Tuple2',
								_0: _user$project$Parser_Parser$ParseMatchesReturnsNothing,
								_1: {ctor: '[]'}
							},
							A2(
								_user$project$Parser_Parser$createParseTokenIgnoreFunction,
								_user$project$Parser_Tokenizer$LeftAngleBracket,
								_user$project$Parser_Tokenizer$tokenize('<')))),
					_1: {
						ctor: '::',
						_0: A2(
							_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
							'createParseTokenKeepFunction',
							A2(
								_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
								{
									ctor: '_Tuple2',
									_0: _user$project$Parser_Parser$ParseMatchesReturnsResult(
										_user$project$Parser_Parser$UnlabelledAstNode(
											_user$project$Parser_Parser$AstLeaf('<'))),
									_1: {ctor: '[]'}
								},
								A2(
									_user$project$Parser_Parser$createParseTokenKeepFunction,
									_user$project$Parser_Tokenizer$LeftAngleBracket,
									_user$project$Parser_Tokenizer$tokenize('<')))),
						_1: {
							ctor: '::',
							_0: A2(
								_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
								'createParseTokenKeepFunction',
								A2(
									_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
									{
										ctor: '_Tuple2',
										_0: _user$project$Parser_Parser$ParseMatchesReturnsResult(
											_user$project$Parser_Parser$LabelledAstNode(
												{
													label: 'LEFT_ANGLE_BRACKET',
													value: _user$project$Parser_Parser$AstLeaf('<')
												})),
										_1: {ctor: '[]'}
									},
									function () {
										var parseBracket = A2(
											_user$project$Parser_Parser$labelled,
											'LEFT_ANGLE_BRACKET',
											_user$project$Parser_Parser$createParseTokenKeepFunction(_user$project$Parser_Tokenizer$LeftAngleBracket));
										return parseBracket(
											_user$project$Parser_Tokenizer$tokenize('<'));
									}())),
							_1: {
								ctor: '::',
								_0: A2(
									_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
									'parseLeftAngleBracket',
									A2(
										_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
										{
											ctor: '_Tuple2',
											_0: _user$project$Parser_Parser$ParseMatchesReturnsNothing,
											_1: {ctor: '[]'}
										},
										_user$project$Parser_Parser$parseLeftAngleBracket(_user$project$Parser_Parser$testTokens))),
								_1: {
									ctor: '::',
									_0: A2(
										_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
										'parseWordKeep',
										A2(
											_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
											{
												ctor: '_Tuple2',
												_0: _user$project$Parser_Parser$ParseMatchesReturnsResult(
													_user$project$Parser_Parser$UnlabelledAstNode(
														_user$project$Parser_Parser$AstLeaf('h1'))),
												_1: {ctor: '[]'}
											},
											_user$project$Parser_Parser$parseWordKeep(
												_user$project$Parser_Tokenizer$tokenize('h1')))),
									_1: {
										ctor: '::',
										_0: A2(
											_rtfeldman$legacy_elm_test$Legacy_ElmTest$suite,
											'optionallyParseMultiple',
											function () {
												var optionallyParseMultipleLeftBrackets = _user$project$Parser_Parser$createOptionallyParseMultipleFunction(_user$project$Parser_Parser$parseLeftAngleBracketKeep);
												return {
													ctor: '::',
													_0: A2(
														_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
														'optionallyParseMultiple',
														A2(
															_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
															{
																ctor: '_Tuple2',
																_0: _user$project$Parser_Parser$ParseMatchesReturnsResult(
																	_user$project$Parser_Parser$UnlabelledAstNode(
																		_user$project$Parser_Parser$AstChildren(
																			{
																				ctor: '::',
																				_0: _user$project$Parser_Parser$UnlabelledAstNode(
																					_user$project$Parser_Parser$AstLeaf('<')),
																				_1: {
																					ctor: '::',
																					_0: _user$project$Parser_Parser$UnlabelledAstNode(
																						_user$project$Parser_Parser$AstLeaf('<')),
																					_1: {ctor: '[]'}
																				}
																			}))),
																_1: {ctor: '[]'}
															},
															optionallyParseMultipleLeftBrackets(
																{
																	ctor: '::',
																	_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$LeftAngleBracket, _1: '<'},
																	_1: {
																		ctor: '::',
																		_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$LeftAngleBracket, _1: '<'},
																		_1: {ctor: '[]'}
																	}
																}))),
													_1: {
														ctor: '::',
														_0: A2(
															_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
															'optionallyParseMultiple',
															A2(
																_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
																{
																	ctor: '_Tuple2',
																	_0: _user$project$Parser_Parser$ParseMatchesReturnsResult(
																		_user$project$Parser_Parser$UnlabelledAstNode(
																			_user$project$Parser_Parser$AstChildren(
																				{
																					ctor: '::',
																					_0: _user$project$Parser_Parser$UnlabelledAstNode(
																						_user$project$Parser_Parser$AstLeaf('<')),
																					_1: {ctor: '[]'}
																				}))),
																	_1: {
																		ctor: '::',
																		_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$Word, _1: 'hello'},
																		_1: {ctor: '[]'}
																	}
																},
																optionallyParseMultipleLeftBrackets(
																	{
																		ctor: '::',
																		_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$LeftAngleBracket, _1: '<'},
																		_1: {
																			ctor: '::',
																			_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$Word, _1: 'hello'},
																			_1: {ctor: '[]'}
																		}
																	}))),
														_1: {
															ctor: '::',
															_0: A2(
																_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
																'optionallyParseMultiple',
																A2(
																	_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
																	{
																		ctor: '_Tuple2',
																		_0: _user$project$Parser_Parser$ParseMatchesReturnsResult(
																			_user$project$Parser_Parser$UnlabelledAstNode(
																				_user$project$Parser_Parser$AstChildren(
																					{ctor: '[]'}))),
																		_1: {
																			ctor: '::',
																			_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$Word, _1: 'hello'},
																			_1: {ctor: '[]'}
																		}
																	},
																	optionallyParseMultipleLeftBrackets(
																		_user$project$Parser_Tokenizer$tokenize('hello')))),
															_1: {ctor: '[]'}
														}
													}
												};
											}()),
										_1: {
											ctor: '::',
											_0: A2(
												_rtfeldman$legacy_elm_test$Legacy_ElmTest$suite,
												'parseAny',
												function () {
													var parseLeftOrRightBracket = _user$project$Parser_Parser$createParseAnyFunction(
														{
															ctor: '::',
															_0: _user$project$Parser_Parser$parseLeftAngleBracket,
															_1: {
																ctor: '::',
																_0: _user$project$Parser_Parser$parseRightAngleBracket,
																_1: {ctor: '[]'}
															}
														});
													return {
														ctor: '::',
														_0: A2(
															_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
															'parseAny left',
															A2(
																_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
																{
																	ctor: '_Tuple2',
																	_0: _user$project$Parser_Parser$ParseMatchesReturnsNothing,
																	_1: {ctor: '[]'}
																},
																parseLeftOrRightBracket(
																	_user$project$Parser_Tokenizer$tokenize('<')))),
														_1: {
															ctor: '::',
															_0: A2(
																_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
																'parseAny right',
																A2(
																	_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
																	{
																		ctor: '_Tuple2',
																		_0: _user$project$Parser_Parser$ParseMatchesReturnsNothing,
																		_1: {ctor: '[]'}
																	},
																	parseLeftOrRightBracket(
																		_user$project$Parser_Tokenizer$tokenize('>')))),
															_1: {
																ctor: '::',
																_0: A2(
																	_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
																	'parseAny none',
																	A2(
																		_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
																		{
																			ctor: '_Tuple2',
																			_0: _user$project$Parser_Parser$ParseDoesNotMatch,
																			_1: {
																				ctor: '::',
																				_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$Word, _1: '!'},
																				_1: {ctor: '[]'}
																			}
																		},
																		parseLeftOrRightBracket(
																			_user$project$Parser_Tokenizer$tokenize('!')))),
																_1: {ctor: '[]'}
															}
														}
													};
												}()),
											_1: {
												ctor: '::',
												_0: A2(
													_rtfeldman$legacy_elm_test$Legacy_ElmTest$suite,
													'parseSequence',
													function () {
														var parseSimpleTag = _user$project$Parser_Parser$createParseSequenceFunction(
															{
																ctor: '::',
																_0: _user$project$Parser_Parser$parseLeftAngleBracket,
																_1: {
																	ctor: '::',
																	_0: _user$project$Parser_Parser$parseWordKeep,
																	_1: {
																		ctor: '::',
																		_0: _user$project$Parser_Parser$parseRightAngleBracket,
																		_1: {ctor: '[]'}
																	}
																}
															});
														return {
															ctor: '::',
															_0: A2(
																_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
																'parseSequence',
																A2(
																	_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
																	{
																		ctor: '_Tuple2',
																		_0: _user$project$Parser_Parser$ParseMatchesReturnsResult(
																			_user$project$Parser_Parser$UnlabelledAstNode(
																				_user$project$Parser_Parser$AstChildren(
																					{
																						ctor: '::',
																						_0: _user$project$Parser_Parser$UnlabelledAstNode(
																							_user$project$Parser_Parser$AstLeaf('h1')),
																						_1: {ctor: '[]'}
																					}))),
																		_1: {ctor: '[]'}
																	},
																	parseSimpleTag(
																		_user$project$Parser_Tokenizer$tokenize('<h1>')))),
															_1: {
																ctor: '::',
																_0: A2(
																	_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
																	'parseSequence',
																	A2(
																		_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
																		{
																			ctor: '_Tuple2',
																			_0: _user$project$Parser_Parser$ParseDoesNotMatch,
																			_1: {
																				ctor: '::',
																				_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$LeftAngleBracket, _1: '<'},
																				_1: {
																					ctor: '::',
																					_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$RightAngleBracket, _1: '>'},
																					_1: {ctor: '[]'}
																				}
																			}
																		},
																		parseSimpleTag(
																			_user$project$Parser_Tokenizer$tokenize('<>')))),
																_1: {
																	ctor: '::',
																	_0: A2(
																		_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
																		'parseSequence',
																		function () {
																			var optionalMiddle = _user$project$Parser_Parser$createParseSequenceFunction(
																				{
																					ctor: '::',
																					_0: _user$project$Parser_Parser$parseLeftAngleBracket,
																					_1: {
																						ctor: '::',
																						_0: _user$project$Parser_Parser$optional(_user$project$Parser_Parser$parseWordKeep),
																						_1: {
																							ctor: '::',
																							_0: _user$project$Parser_Parser$parseRightAngleBracket,
																							_1: {ctor: '[]'}
																						}
																					}
																				});
																			return A2(
																				_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
																				{
																					ctor: '_Tuple2',
																					_0: _user$project$Parser_Parser$ParseMatchesReturnsResult(
																						_user$project$Parser_Parser$UnlabelledAstNode(
																							_user$project$Parser_Parser$AstChildren(
																								{ctor: '[]'}))),
																					_1: {ctor: '[]'}
																				},
																				optionalMiddle(
																					_user$project$Parser_Tokenizer$tokenize('<>')));
																		}()),
																	_1: {ctor: '[]'}
																}
															}
														};
													}()),
												_1: {
													ctor: '::',
													_0: A2(
														_rtfeldman$legacy_elm_test$Legacy_ElmTest$suite,
														'parseAtLeastOne',
														function () {
															var parseLeftOrRightBracket = _user$project$Parser_Parser$createParseAnyFunction(
																{
																	ctor: '::',
																	_0: _user$project$Parser_Parser$parseLeftAngleBracketKeep,
																	_1: {
																		ctor: '::',
																		_0: _user$project$Parser_Parser$parseRightAngleBracketKeep,
																		_1: {ctor: '[]'}
																	}
																});
															var parseAtLeastOneLeftOrRightBracket = _user$project$Parser_Parser$createParseAtLeastOneFunction(parseLeftOrRightBracket);
															return {
																ctor: '::',
																_0: A2(
																	_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
																	'parseAtLeastOne',
																	A2(
																		_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
																		{
																			ctor: '_Tuple2',
																			_0: _user$project$Parser_Parser$ParseMatchesReturnsResult(
																				_user$project$Parser_Parser$UnlabelledAstNode(
																					_user$project$Parser_Parser$AstChildren(
																						{
																							ctor: '::',
																							_0: _user$project$Parser_Parser$UnlabelledAstNode(
																								_user$project$Parser_Parser$AstLeaf('<')),
																							_1: {
																								ctor: '::',
																								_0: _user$project$Parser_Parser$UnlabelledAstNode(
																									_user$project$Parser_Parser$AstLeaf('<')),
																								_1: {
																									ctor: '::',
																									_0: _user$project$Parser_Parser$UnlabelledAstNode(
																										_user$project$Parser_Parser$AstLeaf('<')),
																									_1: {ctor: '[]'}
																								}
																							}
																						}))),
																			_1: {
																				ctor: '::',
																				_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$RightAngleBracket, _1: '>'},
																				_1: {ctor: '[]'}
																			}
																		},
																		A2(
																			_user$project$Parser_Parser$createParseAtLeastOneFunction,
																			_user$project$Parser_Parser$parseLeftAngleBracketKeep,
																			{
																				ctor: '::',
																				_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$LeftAngleBracket, _1: '<'},
																				_1: {
																					ctor: '::',
																					_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$LeftAngleBracket, _1: '<'},
																					_1: {
																						ctor: '::',
																						_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$LeftAngleBracket, _1: '<'},
																						_1: {
																							ctor: '::',
																							_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$RightAngleBracket, _1: '>'},
																							_1: {ctor: '[]'}
																						}
																					}
																				}
																			}))),
																_1: {
																	ctor: '::',
																	_0: A2(
																		_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
																		'parseAtLeastOne',
																		A2(
																			_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
																			{
																				ctor: '_Tuple2',
																				_0: _user$project$Parser_Parser$ParseMatchesReturnsResult(
																					_user$project$Parser_Parser$UnlabelledAstNode(
																						_user$project$Parser_Parser$AstChildren(
																							{
																								ctor: '::',
																								_0: _user$project$Parser_Parser$UnlabelledAstNode(
																									_user$project$Parser_Parser$AstLeaf('<')),
																								_1: {
																									ctor: '::',
																									_0: _user$project$Parser_Parser$UnlabelledAstNode(
																										_user$project$Parser_Parser$AstLeaf('>')),
																									_1: {ctor: '[]'}
																								}
																							}))),
																				_1: {
																					ctor: '::',
																					_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$Word, _1: '!'},
																					_1: {ctor: '[]'}
																				}
																			},
																			parseAtLeastOneLeftOrRightBracket(
																				{
																					ctor: '::',
																					_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$LeftAngleBracket, _1: '<'},
																					_1: {
																						ctor: '::',
																						_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$LeftAngleBracket, _1: '>'},
																						_1: {
																							ctor: '::',
																							_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$Word, _1: '!'},
																							_1: {ctor: '[]'}
																						}
																					}
																				}))),
																	_1: {
																		ctor: '::',
																		_0: A2(
																			_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
																			'parseAtLeastOne',
																			A2(
																				_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
																				{
																					ctor: '_Tuple2',
																					_0: _user$project$Parser_Parser$ParseDoesNotMatch,
																					_1: {
																						ctor: '::',
																						_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$Word, _1: '!'},
																						_1: {
																							ctor: '::',
																							_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$LeftAngleBracket, _1: '<'},
																							_1: {ctor: '[]'}
																						}
																					}
																				},
																				parseAtLeastOneLeftOrRightBracket(
																					{
																						ctor: '::',
																						_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$Word, _1: '!'},
																						_1: {
																							ctor: '::',
																							_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$LeftAngleBracket, _1: '<'},
																							_1: {ctor: '[]'}
																						}
																					}))),
																		_1: {ctor: '[]'}
																	}
																}
															};
														}()),
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	});
var _user$project$Parser_Parser$main = _rtfeldman$legacy_elm_test$Legacy_ElmTest$runSuiteHtml(_user$project$Parser_Parser$tests)();

var _user$project$Parser_ParserHelpers$leafNodes = {
	ctor: '::',
	_0: _user$project$Parser_Parser$UnlabelledAstNode(
		_user$project$Parser_Parser$AstLeaf('hello')),
	_1: {
		ctor: '::',
		_0: _user$project$Parser_Parser$UnlabelledAstNode(
			_user$project$Parser_Parser$AstLeaf(' ')),
		_1: {
			ctor: '::',
			_0: _user$project$Parser_Parser$UnlabelledAstNode(
				_user$project$Parser_Parser$AstLeaf('world')),
			_1: {ctor: '[]'}
		}
	}
};
var _user$project$Parser_ParserHelpers$unlabelledLeafs = _user$project$Parser_Parser$UnlabelledAstNode(
	_user$project$Parser_Parser$AstChildren(_user$project$Parser_ParserHelpers$leafNodes));
var _user$project$Parser_ParserHelpers$flattenAstNode = function (astNode) {
	var flatten_ = function (astNode) {
		var _p0 = astNode;
		if (_p0.ctor === 'UnlabelledAstNode') {
			var _p1 = _p0._0;
			if (_p1.ctor === 'AstLeaf') {
				return {
					ctor: '::',
					_0: astNode,
					_1: {ctor: '[]'}
				};
			} else {
				return A3(
					_elm_lang$core$List$foldl,
					flatten__,
					{ctor: '[]'},
					_p1._0);
			}
		} else {
			return _elm_lang$core$Native_Utils.crashCase(
				'Parser.ParserHelpers',
				{
					start: {line: 134, column: 13},
					end: {line: 142, column: 80}
				},
				_p0)('flatten does not support Labelled nodes yet!');
		}
	};
	var flatten__ = F2(
		function (astNode, acc) {
			return A2(
				_elm_lang$core$Basics_ops['++'],
				acc,
				flatten_(astNode));
		});
	var _p3 = astNode;
	if (_p3.ctor === 'UnlabelledAstNode') {
		var _p4 = _p3._0;
		if (_p4.ctor === 'AstLeaf') {
			return astNode;
		} else {
			return _user$project$Parser_Parser$UnlabelledAstNode(
				_user$project$Parser_Parser$AstChildren(
					flatten_(astNode)));
		}
	} else {
		return _elm_lang$core$Native_Utils.crashCase(
			'Parser.ParserHelpers',
			{
				start: {line: 149, column: 9},
				end: {line: 157, column: 76}
			},
			_p3)('flatten does not support Labelled nodes yet!');
	}
};
var _user$project$Parser_ParserHelpers$flatten = function (parseFunction) {
	var f = function (tokens) {
		var _p6 = parseFunction(tokens);
		if ((_p6.ctor === '_Tuple2') && (_p6._0.ctor === 'ParseMatchesReturnsResult')) {
			return {
				ctor: '_Tuple2',
				_0: _user$project$Parser_Parser$ParseMatchesReturnsResult(
					_user$project$Parser_ParserHelpers$flattenAstNode(_p6._0._0)),
				_1: _p6._1
			};
		} else {
			return _p6;
		}
	};
	return f;
};
var _user$project$Parser_ParserHelpers$getLabel = function (astNode) {
	var _p7 = astNode;
	if (_p7.ctor === 'LabelledAstNode') {
		return _p7._0.label;
	} else {
		return _elm_lang$core$Native_Utils.crashCase(
			'Parser.ParserHelpers',
			{
				start: {line: 121, column: 5},
				end: {line: 125, column: 28}
			},
			_p7)('');
	}
};
var _user$project$Parser_ParserHelpers$unsafeTail = function (xs) {
	var _p9 = xs;
	if (_p9.ctor === '::') {
		return _p9._1;
	} else {
		return _elm_lang$core$Native_Utils.crashCase(
			'Parser.ParserHelpers',
			{
				start: {line: 101, column: 5},
				end: {line: 105, column: 28}
			},
			_p9)('');
	}
};
var _user$project$Parser_ParserHelpers$unsafeHead = function (xs) {
	var _p11 = xs;
	if (_p11.ctor === '::') {
		return _p11._0;
	} else {
		return _elm_lang$core$Native_Utils.crashCase(
			'Parser.ParserHelpers',
			{
				start: {line: 94, column: 5},
				end: {line: 98, column: 55}
			},
			_p11)('unsafe Head returned crash!');
	}
};
var _user$project$Parser_ParserHelpers$listToPair = function (xs) {
	return {
		ctor: '_Tuple2',
		_0: _user$project$Parser_ParserHelpers$unsafeHead(xs),
		_1: _user$project$Parser_ParserHelpers$unsafeHead(
			_user$project$Parser_ParserHelpers$unsafeTail(xs))
	};
};
var _user$project$Parser_ParserHelpers$listTo3Tuple = function (children) {
	return {
		ctor: '_Tuple3',
		_0: _user$project$Parser_ParserHelpers$unsafeHead(children),
		_1: _user$project$Parser_ParserHelpers$unsafeHead(
			_user$project$Parser_ParserHelpers$unsafeTail(children)),
		_2: _user$project$Parser_ParserHelpers$unsafeHead(
			_user$project$Parser_ParserHelpers$unsafeTail(
				_user$project$Parser_ParserHelpers$unsafeTail(children)))
	};
};
var _user$project$Parser_ParserHelpers$unpackListFromNode = function (astNode) {
	var _p13 = astNode;
	if (_p13.ctor === 'UnlabelledAstNode') {
		var _p15 = _p13._0;
		var _p14 = _p15;
		if (_p14.ctor === 'AstChildren') {
			return _p14._0;
		} else {
			return {
				ctor: '::',
				_0: _user$project$Parser_Parser$UnlabelledAstNode(_p15),
				_1: {ctor: '[]'}
			};
		}
	} else {
		var _p17 = _p13._0.value;
		var _p16 = _p17;
		if (_p16.ctor === 'AstChildren') {
			return _p16._0;
		} else {
			return {
				ctor: '::',
				_0: _user$project$Parser_Parser$UnlabelledAstNode(_p17),
				_1: {ctor: '[]'}
			};
		}
	}
};
var _user$project$Parser_ParserHelpers$unpackStringFromNode = function (astNode) {
	var _p18 = astNode;
	if (_p18.ctor === 'UnlabelledAstNode') {
		var _p19 = _p18._0;
		if (_p19.ctor === 'AstLeaf') {
			return _p19._0;
		} else {
			return A3(
				_elm_lang$core$List$foldr,
				F2(
					function (x, y) {
						return A2(_elm_lang$core$Basics_ops['++'], x, y);
					}),
				'',
				_user$project$Parser_ParserHelpers$unpackStringsFromNode(astNode));
		}
	} else {
		return _elm_lang$core$Native_Utils.crashCase(
			'Parser.ParserHelpers',
			{
				start: {line: 55, column: 5},
				end: {line: 62, column: 28}
			},
			_p18)('');
	}
};
var _user$project$Parser_ParserHelpers$unpackStringsFromNode = function (astNode) {
	var nodes = _user$project$Parser_ParserHelpers$unpackListFromNode(astNode);
	var strings = A2(_elm_lang$core$List$map, _user$project$Parser_ParserHelpers$unpackStringFromNode, nodes);
	return strings;
};
var _user$project$Parser_ParserHelpers$concatLeafs = function (astNode) {
	var strings = _user$project$Parser_ParserHelpers$unpackStringsFromNode(astNode);
	return A3(
		_elm_lang$core$List$foldr,
		F2(
			function (x, y) {
				return A2(_elm_lang$core$Basics_ops['++'], x, y);
			}),
		'',
		strings);
};
var _user$project$Parser_ParserHelpers$tests = A2(
	_rtfeldman$legacy_elm_test$Legacy_ElmTest$suite,
	'ParserHelpers.elm',
	{
		ctor: '::',
		_0: A2(
			_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
			'unpackStringFromNode',
			A2(
				_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
				'hello',
				_user$project$Parser_ParserHelpers$unpackStringFromNode(
					_user$project$Parser_Parser$UnlabelledAstNode(
						_user$project$Parser_Parser$AstLeaf('hello'))))),
		_1: {
			ctor: '::',
			_0: A2(
				_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
				'unpackStringFromNode (nested)',
				A2(
					_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
					'hello world',
					_user$project$Parser_ParserHelpers$concatLeafs(_user$project$Parser_ParserHelpers$unlabelledLeafs))),
			_1: {
				ctor: '::',
				_0: A2(
					_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
					'listToPair',
					A2(
						_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
						{ctor: '_Tuple2', _0: 1, _1: 2},
						_user$project$Parser_ParserHelpers$listToPair(
							{
								ctor: '::',
								_0: 1,
								_1: {
									ctor: '::',
									_0: 2,
									_1: {ctor: '[]'}
								}
							}))),
				_1: {
					ctor: '::',
					_0: A2(
						_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
						'listTo3Tuple',
						A2(
							_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
							{ctor: '_Tuple3', _0: 1, _1: 2, _2: 3},
							_user$project$Parser_ParserHelpers$listTo3Tuple(
								{
									ctor: '::',
									_0: 1,
									_1: {
										ctor: '::',
										_0: 2,
										_1: {
											ctor: '::',
											_0: 3,
											_1: {ctor: '[]'}
										}
									}
								}))),
					_1: {
						ctor: '::',
						_0: A2(
							_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
							'getLabel',
							A2(
								_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
								'SOMETHING',
								_user$project$Parser_ParserHelpers$getLabel(
									_user$project$Parser_Parser$LabelledAstNode(
										{
											label: 'SOMETHING',
											value: _user$project$Parser_Parser$AstLeaf('hello')
										})))),
						_1: {
							ctor: '::',
							_0: A2(
								_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
								'flattenAstNode (identity for leaf)',
								A2(
									_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
									_user$project$Parser_Parser$UnlabelledAstNode(
										_user$project$Parser_Parser$AstLeaf('hello')),
									_user$project$Parser_ParserHelpers$flattenAstNode(
										_user$project$Parser_Parser$UnlabelledAstNode(
											_user$project$Parser_Parser$AstLeaf('hello'))))),
							_1: {
								ctor: '::',
								_0: A2(
									_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
									'flattenAstNode (identity for AstChildren)',
									A2(
										_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
										_user$project$Parser_Parser$UnlabelledAstNode(
											_user$project$Parser_Parser$AstChildren(
												{
													ctor: '::',
													_0: _user$project$Parser_Parser$UnlabelledAstNode(
														_user$project$Parser_Parser$AstLeaf('hello')),
													_1: {ctor: '[]'}
												})),
										_user$project$Parser_ParserHelpers$flattenAstNode(
											_user$project$Parser_Parser$UnlabelledAstNode(
												_user$project$Parser_Parser$AstChildren(
													{
														ctor: '::',
														_0: _user$project$Parser_Parser$UnlabelledAstNode(
															_user$project$Parser_Parser$AstLeaf('hello')),
														_1: {ctor: '[]'}
													}))))),
								_1: {
									ctor: '::',
									_0: A2(
										_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
										'flattenAstNode (identity for multiple AstChildren)',
										A2(
											_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
											_user$project$Parser_Parser$UnlabelledAstNode(
												_user$project$Parser_Parser$AstChildren(
													{
														ctor: '::',
														_0: _user$project$Parser_Parser$UnlabelledAstNode(
															_user$project$Parser_Parser$AstLeaf('one')),
														_1: {
															ctor: '::',
															_0: _user$project$Parser_Parser$UnlabelledAstNode(
																_user$project$Parser_Parser$AstLeaf('two')),
															_1: {ctor: '[]'}
														}
													})),
											_user$project$Parser_ParserHelpers$flattenAstNode(
												_user$project$Parser_Parser$UnlabelledAstNode(
													_user$project$Parser_Parser$AstChildren(
														{
															ctor: '::',
															_0: _user$project$Parser_Parser$UnlabelledAstNode(
																_user$project$Parser_Parser$AstLeaf('one')),
															_1: {
																ctor: '::',
																_0: _user$project$Parser_Parser$UnlabelledAstNode(
																	_user$project$Parser_Parser$AstLeaf('two')),
																_1: {ctor: '[]'}
															}
														}))))),
									_1: {
										ctor: '::',
										_0: A2(
											_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
											'flattenAstNode (nested)',
											A2(
												_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
												_user$project$Parser_Parser$UnlabelledAstNode(
													_user$project$Parser_Parser$AstChildren(
														{
															ctor: '::',
															_0: _user$project$Parser_Parser$UnlabelledAstNode(
																_user$project$Parser_Parser$AstLeaf('one')),
															_1: {
																ctor: '::',
																_0: _user$project$Parser_Parser$UnlabelledAstNode(
																	_user$project$Parser_Parser$AstLeaf('two')),
																_1: {
																	ctor: '::',
																	_0: _user$project$Parser_Parser$UnlabelledAstNode(
																		_user$project$Parser_Parser$AstLeaf('three')),
																	_1: {ctor: '[]'}
																}
															}
														})),
												_user$project$Parser_ParserHelpers$flattenAstNode(
													_user$project$Parser_Parser$UnlabelledAstNode(
														_user$project$Parser_Parser$AstChildren(
															{
																ctor: '::',
																_0: _user$project$Parser_Parser$UnlabelledAstNode(
																	_user$project$Parser_Parser$AstChildren(
																		{
																			ctor: '::',
																			_0: _user$project$Parser_Parser$UnlabelledAstNode(
																				_user$project$Parser_Parser$AstLeaf('one')),
																			_1: {ctor: '[]'}
																		})),
																_1: {
																	ctor: '::',
																	_0: _user$project$Parser_Parser$UnlabelledAstNode(
																		_user$project$Parser_Parser$AstChildren(
																			{
																				ctor: '::',
																				_0: _user$project$Parser_Parser$UnlabelledAstNode(
																					_user$project$Parser_Parser$AstLeaf('two')),
																				_1: {
																					ctor: '::',
																					_0: _user$project$Parser_Parser$UnlabelledAstNode(
																						_user$project$Parser_Parser$AstChildren(
																							{
																								ctor: '::',
																								_0: _user$project$Parser_Parser$UnlabelledAstNode(
																									_user$project$Parser_Parser$AstLeaf('three')),
																								_1: {ctor: '[]'}
																							})),
																					_1: {ctor: '[]'}
																				}
																			})),
																	_1: {ctor: '[]'}
																}
															}))))),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}
			}
		}
	});
var _user$project$Parser_ParserHelpers$main = _rtfeldman$legacy_elm_test$Legacy_ElmTest$runSuiteHtml(_user$project$Parser_ParserHelpers$tests)();
var _user$project$Parser_ParserHelpers$parseWordKeep = _user$project$Parser_Parser$createParseTokenKeepFunction(_user$project$Parser_Tokenizer$Word);
var _user$project$Parser_ParserHelpers$parseDashKeep = _user$project$Parser_Parser$createParseTokenKeepFunction(_user$project$Parser_Tokenizer$Dash);
var _user$project$Parser_ParserHelpers$parseExclamationMarkKeep = _user$project$Parser_Parser$createParseTokenKeepFunction(_user$project$Parser_Tokenizer$ExclamationMark);
var _user$project$Parser_ParserHelpers$parseSingleQuotationMarkKeep = _user$project$Parser_Parser$createParseTokenKeepFunction(_user$project$Parser_Tokenizer$SingleQuotationMark);
var _user$project$Parser_ParserHelpers$parseDoubleQuotationMarkKeep = _user$project$Parser_Parser$createParseTokenKeepFunction(_user$project$Parser_Tokenizer$DoubleQuotationMark);
var _user$project$Parser_ParserHelpers$parseWhitespaceKeep = _user$project$Parser_Parser$createParseTokenKeepFunction(_user$project$Parser_Tokenizer$Whitespace);
var _user$project$Parser_ParserHelpers$parseEqualsSignKeep = _user$project$Parser_Parser$createParseTokenKeepFunction(_user$project$Parser_Tokenizer$EqualsSign);
var _user$project$Parser_ParserHelpers$parseForwardSlashKeep = _user$project$Parser_Parser$createParseTokenKeepFunction(_user$project$Parser_Tokenizer$ForwardSlash);
var _user$project$Parser_ParserHelpers$parseRightAngleBracketKeep = _user$project$Parser_Parser$createParseTokenKeepFunction(_user$project$Parser_Tokenizer$RightAngleBracket);
var _user$project$Parser_ParserHelpers$parseLeftAngleBracketKeep = _user$project$Parser_Parser$createParseTokenKeepFunction(_user$project$Parser_Tokenizer$LeftAngleBracket);
var _user$project$Parser_ParserHelpers$parseDashIgnore = _user$project$Parser_Parser$createParseTokenIgnoreFunction(_user$project$Parser_Tokenizer$Dash);
var _user$project$Parser_ParserHelpers$parseExclamationMarkIgnore = _user$project$Parser_Parser$createParseTokenIgnoreFunction(_user$project$Parser_Tokenizer$ExclamationMark);
var _user$project$Parser_ParserHelpers$parseSingleQuotationMarkIgnore = _user$project$Parser_Parser$createParseTokenIgnoreFunction(_user$project$Parser_Tokenizer$SingleQuotationMark);
var _user$project$Parser_ParserHelpers$parseDoubleQuotationMarkIgnore = _user$project$Parser_Parser$createParseTokenIgnoreFunction(_user$project$Parser_Tokenizer$DoubleQuotationMark);
var _user$project$Parser_ParserHelpers$parseWhitespaceIgnore = _user$project$Parser_Parser$createParseTokenIgnoreFunction(_user$project$Parser_Tokenizer$Whitespace);
var _user$project$Parser_ParserHelpers$parseIgnoreOptionalWhitespace = _user$project$Parser_Parser$optional(_user$project$Parser_ParserHelpers$parseWhitespaceIgnore);
var _user$project$Parser_ParserHelpers$parseEqualsSignIgnore = _user$project$Parser_Parser$createParseTokenIgnoreFunction(_user$project$Parser_Tokenizer$EqualsSign);
var _user$project$Parser_ParserHelpers$parseForwardSlashIgnore = _user$project$Parser_Parser$createParseTokenIgnoreFunction(_user$project$Parser_Tokenizer$ForwardSlash);
var _user$project$Parser_ParserHelpers$parseRightAngleBracketIgnore = _user$project$Parser_Parser$createParseTokenIgnoreFunction(_user$project$Parser_Tokenizer$RightAngleBracket);
var _user$project$Parser_ParserHelpers$parseLeftAngleBracketIgnore = _user$project$Parser_Parser$createParseTokenIgnoreFunction(_user$project$Parser_Tokenizer$LeftAngleBracket);

var _user$project$HtmlParser_HtmlParserRawAst$testClosingTagNode = _user$project$Parser_Parser$LabelledAstNode(
	{
		label: 'CLOSING_TAG',
		value: _user$project$Parser_Parser$AstChildren(
			{
				ctor: '::',
				_0: _user$project$Parser_Parser$UnlabelledAstNode(
					_user$project$Parser_Parser$AstLeaf('div')),
				_1: {ctor: '[]'}
			})
	});
var _user$project$HtmlParser_HtmlParserRawAst$testTextNode = _user$project$Parser_Parser$LabelledAstNode(
	{
		label: 'TEXT',
		value: _user$project$Parser_Parser$AstChildren(
			{
				ctor: '::',
				_0: _user$project$Parser_Parser$UnlabelledAstNode(
					_user$project$Parser_Parser$AstLeaf('one')),
				_1: {
					ctor: '::',
					_0: _user$project$Parser_Parser$UnlabelledAstNode(
						_user$project$Parser_Parser$AstLeaf(' ')),
					_1: {
						ctor: '::',
						_0: _user$project$Parser_Parser$UnlabelledAstNode(
							_user$project$Parser_Parser$AstLeaf('two')),
						_1: {ctor: '[]'}
					}
				}
			})
	});
var _user$project$HtmlParser_HtmlParserRawAst$attributeId1 = _user$project$Parser_Parser$UnlabelledAstNode(
	_user$project$Parser_Parser$AstChildren(
		{
			ctor: '::',
			_0: _user$project$Parser_Parser$UnlabelledAstNode(
				_user$project$Parser_Parser$AstChildren(
					{
						ctor: '::',
						_0: _user$project$Parser_Parser$UnlabelledAstNode(
							_user$project$Parser_Parser$AstLeaf('id')),
						_1: {ctor: '[]'}
					})),
			_1: {
				ctor: '::',
				_0: _user$project$Parser_Parser$UnlabelledAstNode(
					_user$project$Parser_Parser$AstChildren(
						{
							ctor: '::',
							_0: _user$project$Parser_Parser$UnlabelledAstNode(
								_user$project$Parser_Parser$AstLeaf('1')),
							_1: {ctor: '[]'}
						})),
				_1: {ctor: '[]'}
			}
		}));
var _user$project$HtmlParser_HtmlParserRawAst$attributeValueSuccessAwesome = _user$project$Parser_Parser$UnlabelledAstNode(
	_user$project$Parser_Parser$AstChildren(
		{
			ctor: '::',
			_0: _user$project$Parser_Parser$UnlabelledAstNode(
				_user$project$Parser_Parser$AstLeaf('success')),
			_1: {
				ctor: '::',
				_0: _user$project$Parser_Parser$UnlabelledAstNode(
					_user$project$Parser_Parser$AstLeaf(' ')),
				_1: {
					ctor: '::',
					_0: _user$project$Parser_Parser$UnlabelledAstNode(
						_user$project$Parser_Parser$AstLeaf('awesome')),
					_1: {ctor: '[]'}
				}
			}
		}));
var _user$project$HtmlParser_HtmlParserRawAst$attributeKeyClass = _user$project$Parser_Parser$UnlabelledAstNode(
	_user$project$Parser_Parser$AstChildren(
		{
			ctor: '::',
			_0: _user$project$Parser_Parser$UnlabelledAstNode(
				_user$project$Parser_Parser$AstLeaf('class')),
			_1: {ctor: '[]'}
		}));
var _user$project$HtmlParser_HtmlParserRawAst$attributeSuccessAwesome = _user$project$Parser_Parser$UnlabelledAstNode(
	_user$project$Parser_Parser$AstChildren(
		{
			ctor: '::',
			_0: _user$project$HtmlParser_HtmlParserRawAst$attributeKeyClass,
			_1: {
				ctor: '::',
				_0: _user$project$HtmlParser_HtmlParserRawAst$attributeValueSuccessAwesome,
				_1: {ctor: '[]'}
			}
		}));
var _user$project$HtmlParser_HtmlParserRawAst$twoAttributes = _user$project$Parser_Parser$UnlabelledAstNode(
	_user$project$Parser_Parser$AstChildren(
		{
			ctor: '::',
			_0: _user$project$HtmlParser_HtmlParserRawAst$attributeId1,
			_1: {
				ctor: '::',
				_0: _user$project$HtmlParser_HtmlParserRawAst$attributeSuccessAwesome,
				_1: {ctor: '[]'}
			}
		}));
var _user$project$HtmlParser_HtmlParserRawAst$testOpeningTagNode = _user$project$Parser_Parser$LabelledAstNode(
	{
		label: 'OPENING_TAG',
		value: _user$project$Parser_Parser$AstChildren(
			{
				ctor: '::',
				_0: _user$project$Parser_Parser$UnlabelledAstNode(
					_user$project$Parser_Parser$AstLeaf('div')),
				_1: {
					ctor: '::',
					_0: _user$project$HtmlParser_HtmlParserRawAst$twoAttributes,
					_1: {ctor: '[]'}
				}
			})
	});
var _user$project$HtmlParser_HtmlParserRawAst$testSelfClosingTagNode = _user$project$Parser_Parser$LabelledAstNode(
	{
		label: 'SELF_CLOSING_TAG',
		value: _user$project$Parser_Parser$AstChildren(
			{
				ctor: '::',
				_0: _user$project$Parser_Parser$UnlabelledAstNode(
					_user$project$Parser_Parser$AstLeaf('img')),
				_1: {
					ctor: '::',
					_0: _user$project$HtmlParser_HtmlParserRawAst$twoAttributes,
					_1: {ctor: '[]'}
				}
			})
	});
var _user$project$HtmlParser_HtmlParserRawAst$parseClosingCommentIgnore = _user$project$Parser_Parser$createParseTokenIgnoreFunction(_user$project$Parser_Tokenizer$ClosingComment);
var _user$project$HtmlParser_HtmlParserRawAst$parseOpeningCommentIgnore = _user$project$Parser_Parser$createParseTokenIgnoreFunction(_user$project$Parser_Tokenizer$OpeningComment);
var _user$project$HtmlParser_HtmlParserRawAst$parseTextNode = A2(
	_user$project$Parser_Parser$labelled,
	'TEXT',
	_user$project$Parser_Parser$createParseAtLeastOneFunction(
		_user$project$Parser_Parser$createParseAnyFunction(
			{
				ctor: '::',
				_0: _user$project$Parser_ParserHelpers$parseWordKeep,
				_1: {
					ctor: '::',
					_0: _user$project$Parser_ParserHelpers$parseWhitespaceKeep,
					_1: {
						ctor: '::',
						_0: _user$project$Parser_ParserHelpers$parseDashKeep,
						_1: {
							ctor: '::',
							_0: _user$project$Parser_ParserHelpers$parseEqualsSignKeep,
							_1: {
								ctor: '::',
								_0: _user$project$Parser_ParserHelpers$parseDoubleQuotationMarkKeep,
								_1: {
									ctor: '::',
									_0: _user$project$Parser_ParserHelpers$parseSingleQuotationMarkKeep,
									_1: {
										ctor: '::',
										_0: _user$project$Parser_ParserHelpers$parseForwardSlashKeep,
										_1: {
											ctor: '::',
											_0: _user$project$Parser_ParserHelpers$parseDashKeep,
											_1: {
												ctor: '::',
												_0: _user$project$Parser_ParserHelpers$parseRightAngleBracketKeep,
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						}
					}
				}
			})));
var _user$project$HtmlParser_HtmlParserRawAst$parseComment = _user$project$Parser_Parser$ignore(
	_user$project$Parser_Parser$createParseSequenceFunction(
		{
			ctor: '::',
			_0: _user$project$Parser_Parser$createParseTokenIgnoreFunction(_user$project$Parser_Tokenizer$OpeningComment),
			_1: {
				ctor: '::',
				_0: _user$project$HtmlParser_HtmlParserRawAst$parseTextNode,
				_1: {
					ctor: '::',
					_0: _user$project$Parser_Parser$createParseTokenIgnoreFunction(_user$project$Parser_Tokenizer$ClosingComment),
					_1: {ctor: '[]'}
				}
			}
		}));
var _user$project$HtmlParser_HtmlParserRawAst$parseClosingTag = A2(
	_user$project$Parser_Parser$labelled,
	'CLOSING_TAG',
	_user$project$Parser_Parser$createParseSequenceFunction(
		{
			ctor: '::',
			_0: _user$project$Parser_ParserHelpers$parseIgnoreOptionalWhitespace,
			_1: {
				ctor: '::',
				_0: _user$project$Parser_ParserHelpers$parseLeftAngleBracketIgnore,
				_1: {
					ctor: '::',
					_0: _user$project$Parser_ParserHelpers$parseForwardSlashIgnore,
					_1: {
						ctor: '::',
						_0: _user$project$Parser_ParserHelpers$parseWordKeep,
						_1: {
							ctor: '::',
							_0: _user$project$Parser_ParserHelpers$parseRightAngleBracketIgnore,
							_1: {
								ctor: '::',
								_0: _user$project$Parser_ParserHelpers$parseIgnoreOptionalWhitespace,
								_1: {ctor: '[]'}
							}
						}
					}
				}
			}
		}));
var _user$project$HtmlParser_HtmlParserRawAst$parseDoubleQuotedString = _user$project$Parser_Parser$createParseAtLeastOneFunction(
	_user$project$Parser_Parser$createParseAnyFunction(
		{
			ctor: '::',
			_0: _user$project$Parser_ParserHelpers$parseWordKeep,
			_1: {
				ctor: '::',
				_0: _user$project$Parser_ParserHelpers$parseDashKeep,
				_1: {
					ctor: '::',
					_0: _user$project$Parser_ParserHelpers$parseLeftAngleBracketKeep,
					_1: {
						ctor: '::',
						_0: _user$project$Parser_ParserHelpers$parseRightAngleBracketKeep,
						_1: {
							ctor: '::',
							_0: _user$project$Parser_ParserHelpers$parseForwardSlashKeep,
							_1: {
								ctor: '::',
								_0: _user$project$Parser_ParserHelpers$parseEqualsSignKeep,
								_1: {
									ctor: '::',
									_0: _user$project$Parser_ParserHelpers$parseWhitespaceKeep,
									_1: {
										ctor: '::',
										_0: _user$project$Parser_ParserHelpers$parseSingleQuotationMarkKeep,
										_1: {
											ctor: '::',
											_0: _user$project$Parser_ParserHelpers$parseExclamationMarkKeep,
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					}
				}
			}
		}));
var _user$project$HtmlParser_HtmlParserRawAst$parseTagAttributeValue = _user$project$Parser_ParserHelpers$flatten(
	_user$project$Parser_Parser$createParseSequenceFunction(
		{
			ctor: '::',
			_0: _user$project$Parser_ParserHelpers$parseEqualsSignIgnore,
			_1: {
				ctor: '::',
				_0: _user$project$Parser_Parser$createParseAnyFunction(
					{
						ctor: '::',
						_0: _user$project$Parser_ParserHelpers$parseDoubleQuotationMarkIgnore,
						_1: {
							ctor: '::',
							_0: _user$project$Parser_ParserHelpers$parseSingleQuotationMarkIgnore,
							_1: {ctor: '[]'}
						}
					}),
				_1: {
					ctor: '::',
					_0: _user$project$Parser_Parser$createOptionallyParseMultipleFunction(
						_user$project$Parser_Parser$createParseAnyFunction(
							{
								ctor: '::',
								_0: _user$project$HtmlParser_HtmlParserRawAst$parseDoubleQuotedString,
								_1: {ctor: '[]'}
							})),
					_1: {
						ctor: '::',
						_0: _user$project$Parser_Parser$createParseAnyFunction(
							{
								ctor: '::',
								_0: _user$project$Parser_ParserHelpers$parseDoubleQuotationMarkIgnore,
								_1: {
									ctor: '::',
									_0: _user$project$Parser_ParserHelpers$parseSingleQuotationMarkIgnore,
									_1: {ctor: '[]'}
								}
							}),
						_1: {ctor: '[]'}
					}
				}
			}
		}));
var _user$project$HtmlParser_HtmlParserRawAst$parseWordWithDashes = _user$project$Parser_Parser$createParseAtLeastOneFunction(
	_user$project$Parser_Parser$createParseAnyFunction(
		{
			ctor: '::',
			_0: _user$project$Parser_ParserHelpers$parseWordKeep,
			_1: {
				ctor: '::',
				_0: _user$project$Parser_ParserHelpers$parseDashKeep,
				_1: {ctor: '[]'}
			}
		}));
var _user$project$HtmlParser_HtmlParserRawAst$parseTagAttribute = _user$project$Parser_Parser$createParseSequenceFunction(
	{
		ctor: '::',
		_0: _user$project$Parser_ParserHelpers$parseIgnoreOptionalWhitespace,
		_1: {
			ctor: '::',
			_0: _user$project$HtmlParser_HtmlParserRawAst$parseWordWithDashes,
			_1: {
				ctor: '::',
				_0: _user$project$Parser_Parser$optional(_user$project$HtmlParser_HtmlParserRawAst$parseTagAttributeValue),
				_1: {
					ctor: '::',
					_0: _user$project$Parser_ParserHelpers$parseIgnoreOptionalWhitespace,
					_1: {ctor: '[]'}
				}
			}
		}
	});
var _user$project$HtmlParser_HtmlParserRawAst$parseTagAttributes = _user$project$Parser_Parser$createOptionallyParseMultipleFunction(_user$project$HtmlParser_HtmlParserRawAst$parseTagAttribute);
var _user$project$HtmlParser_HtmlParserRawAst$parseOpeningTag = A2(
	_user$project$Parser_Parser$labelled,
	'OPENING_TAG',
	_user$project$Parser_Parser$createParseSequenceFunction(
		{
			ctor: '::',
			_0: _user$project$Parser_ParserHelpers$parseIgnoreOptionalWhitespace,
			_1: {
				ctor: '::',
				_0: _user$project$Parser_ParserHelpers$parseLeftAngleBracketIgnore,
				_1: {
					ctor: '::',
					_0: _user$project$Parser_ParserHelpers$parseWordKeep,
					_1: {
						ctor: '::',
						_0: _user$project$Parser_ParserHelpers$parseIgnoreOptionalWhitespace,
						_1: {
							ctor: '::',
							_0: _user$project$HtmlParser_HtmlParserRawAst$parseTagAttributes,
							_1: {
								ctor: '::',
								_0: _user$project$Parser_ParserHelpers$parseIgnoreOptionalWhitespace,
								_1: {
									ctor: '::',
									_0: _user$project$Parser_ParserHelpers$parseRightAngleBracketIgnore,
									_1: {
										ctor: '::',
										_0: _user$project$Parser_ParserHelpers$parseIgnoreOptionalWhitespace,
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}
			}
		}));
var _user$project$HtmlParser_HtmlParserRawAst$parseSelfClosingTag = A2(
	_user$project$Parser_Parser$labelled,
	'SELF_CLOSING_TAG',
	_user$project$Parser_Parser$createParseSequenceFunction(
		{
			ctor: '::',
			_0: _user$project$Parser_ParserHelpers$parseLeftAngleBracketIgnore,
			_1: {
				ctor: '::',
				_0: _user$project$Parser_ParserHelpers$parseWordKeep,
				_1: {
					ctor: '::',
					_0: _user$project$Parser_ParserHelpers$parseIgnoreOptionalWhitespace,
					_1: {
						ctor: '::',
						_0: _user$project$HtmlParser_HtmlParserRawAst$parseTagAttributes,
						_1: {
							ctor: '::',
							_0: _user$project$Parser_ParserHelpers$parseIgnoreOptionalWhitespace,
							_1: {
								ctor: '::',
								_0: _user$project$Parser_ParserHelpers$parseForwardSlashIgnore,
								_1: {
									ctor: '::',
									_0: _user$project$Parser_ParserHelpers$parseRightAngleBracketIgnore,
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}
			}
		}));
var _user$project$HtmlParser_HtmlParserRawAst$parseHtmlTokens = _user$project$Parser_Parser$createParseAtLeastOneFunction(
	_user$project$Parser_Parser$createParseAnyFunction(
		{
			ctor: '::',
			_0: _user$project$HtmlParser_HtmlParserRawAst$parseOpeningTag,
			_1: {
				ctor: '::',
				_0: _user$project$HtmlParser_HtmlParserRawAst$parseTextNode,
				_1: {
					ctor: '::',
					_0: _user$project$HtmlParser_HtmlParserRawAst$parseClosingTag,
					_1: {
						ctor: '::',
						_0: _user$project$HtmlParser_HtmlParserRawAst$parseSelfClosingTag,
						_1: {
							ctor: '::',
							_0: _user$project$HtmlParser_HtmlParserRawAst$parseComment,
							_1: {ctor: '[]'}
						}
					}
				}
			}
		}));
var _user$project$HtmlParser_HtmlParserRawAst$xhtmlToRawAst = function (s) {
	var _p0 = _user$project$HtmlParser_HtmlParserRawAst$parseHtmlTokens(
		_user$project$Parser_Tokenizer$tokenize(s));
	var result = _p0._0;
	return result;
};
var _user$project$HtmlParser_HtmlParserRawAst$tests = A2(
	_rtfeldman$legacy_elm_test$Legacy_ElmTest$suite,
	'HtmlParser.elm',
	{
		ctor: '::',
		_0: A2(
			_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
			'parseTagAttribute',
			A2(
				_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
				{
					ctor: '_Tuple2',
					_0: _user$project$Parser_Parser$ParseMatchesReturnsResult(
						_user$project$Parser_Parser$UnlabelledAstNode(
							_user$project$Parser_Parser$AstChildren(
								{
									ctor: '::',
									_0: _user$project$Parser_Parser$UnlabelledAstNode(
										_user$project$Parser_Parser$AstChildren(
											{
												ctor: '::',
												_0: _user$project$Parser_Parser$UnlabelledAstNode(
													_user$project$Parser_Parser$AstLeaf('class')),
												_1: {ctor: '[]'}
											})),
									_1: {
										ctor: '::',
										_0: _user$project$Parser_Parser$UnlabelledAstNode(
											_user$project$Parser_Parser$AstChildren(
												{
													ctor: '::',
													_0: _user$project$Parser_Parser$UnlabelledAstNode(
														_user$project$Parser_Parser$AstLeaf('success')),
													_1: {
														ctor: '::',
														_0: _user$project$Parser_Parser$UnlabelledAstNode(
															_user$project$Parser_Parser$AstLeaf(' ')),
														_1: {
															ctor: '::',
															_0: _user$project$Parser_Parser$UnlabelledAstNode(
																_user$project$Parser_Parser$AstLeaf('awesome')),
															_1: {ctor: '[]'}
														}
													}
												})),
										_1: {ctor: '[]'}
									}
								}))),
					_1: {ctor: '[]'}
				},
				_user$project$HtmlParser_HtmlParserRawAst$parseTagAttribute(
					_user$project$Parser_Tokenizer$tokenize(' class=\"success awesome\" ')))),
		_1: {
			ctor: '::',
			_0: A2(
				_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
				'parseTagAttribute with single quote in value',
				A2(
					_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
					{
						ctor: '_Tuple2',
						_0: _user$project$Parser_Parser$ParseMatchesReturnsResult(
							_user$project$Parser_Parser$UnlabelledAstNode(
								_user$project$Parser_Parser$AstChildren(
									{
										ctor: '::',
										_0: _user$project$Parser_Parser$UnlabelledAstNode(
											_user$project$Parser_Parser$AstChildren(
												{
													ctor: '::',
													_0: _user$project$Parser_Parser$UnlabelledAstNode(
														_user$project$Parser_Parser$AstLeaf('placeholder')),
													_1: {ctor: '[]'}
												})),
										_1: {
											ctor: '::',
											_0: _user$project$Parser_Parser$UnlabelledAstNode(
												_user$project$Parser_Parser$AstChildren(
													{
														ctor: '::',
														_0: _user$project$Parser_Parser$UnlabelledAstNode(
															_user$project$Parser_Parser$AstLeaf('It')),
														_1: {
															ctor: '::',
															_0: _user$project$Parser_Parser$UnlabelledAstNode(
																_user$project$Parser_Parser$AstLeaf('\'')),
															_1: {
																ctor: '::',
																_0: _user$project$Parser_Parser$UnlabelledAstNode(
																	_user$project$Parser_Parser$AstLeaf('s')),
																_1: {
																	ctor: '::',
																	_0: _user$project$Parser_Parser$UnlabelledAstNode(
																		_user$project$Parser_Parser$AstLeaf(' ')),
																	_1: {
																		ctor: '::',
																		_0: _user$project$Parser_Parser$UnlabelledAstNode(
																			_user$project$Parser_Parser$AstLeaf('great')),
																		_1: {ctor: '[]'}
																	}
																}
															}
														}
													})),
											_1: {ctor: '[]'}
										}
									}))),
						_1: {ctor: '[]'}
					},
					_user$project$HtmlParser_HtmlParserRawAst$parseTagAttribute(
						_user$project$Parser_Tokenizer$tokenize(' placeholder=\"It\'s great\" ')))),
			_1: {
				ctor: '::',
				_0: A2(
					_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
					'parse boolean attribute',
					A2(
						_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
						{
							ctor: '_Tuple2',
							_0: _user$project$Parser_Parser$ParseMatchesReturnsResult(
								_user$project$Parser_Parser$UnlabelledAstNode(
									_user$project$Parser_Parser$AstChildren(
										{
											ctor: '::',
											_0: _user$project$Parser_Parser$UnlabelledAstNode(
												_user$project$Parser_Parser$AstChildren(
													{
														ctor: '::',
														_0: _user$project$Parser_Parser$UnlabelledAstNode(
															_user$project$Parser_Parser$AstLeaf('disabled')),
														_1: {ctor: '[]'}
													})),
											_1: {ctor: '[]'}
										}))),
							_1: {ctor: '[]'}
						},
						_user$project$HtmlParser_HtmlParserRawAst$parseTagAttribute(
							_user$project$Parser_Tokenizer$tokenize(' disabled ')))),
				_1: {
					ctor: '::',
					_0: A2(
						_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
						'parseMultipleAttributes',
						A2(
							_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
							{
								ctor: '_Tuple2',
								_0: _user$project$Parser_Parser$ParseMatchesReturnsResult(
									_user$project$Parser_Parser$UnlabelledAstNode(
										_user$project$Parser_Parser$AstChildren(
											{
												ctor: '::',
												_0: _user$project$HtmlParser_HtmlParserRawAst$attributeId1,
												_1: {
													ctor: '::',
													_0: _user$project$HtmlParser_HtmlParserRawAst$attributeSuccessAwesome,
													_1: {ctor: '[]'}
												}
											}))),
								_1: {ctor: '[]'}
							},
							_user$project$HtmlParser_HtmlParserRawAst$parseTagAttributes(
								_user$project$Parser_Tokenizer$tokenize(' id=\"1\" class=\"success awesome\" ')))),
					_1: {
						ctor: '::',
						_0: A2(
							_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
							'parsedDashedAttribute',
							A2(
								_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
								{
									ctor: '_Tuple2',
									_0: _user$project$Parser_Parser$ParseMatchesReturnsResult(
										_user$project$Parser_Parser$UnlabelledAstNode(
											_user$project$Parser_Parser$AstChildren(
												{
													ctor: '::',
													_0: _user$project$Parser_Parser$UnlabelledAstNode(
														_user$project$Parser_Parser$AstChildren(
															{
																ctor: '::',
																_0: _user$project$Parser_Parser$UnlabelledAstNode(
																	_user$project$Parser_Parser$AstChildren(
																		{
																			ctor: '::',
																			_0: _user$project$Parser_Parser$UnlabelledAstNode(
																				_user$project$Parser_Parser$AstLeaf('data')),
																			_1: {
																				ctor: '::',
																				_0: _user$project$Parser_Parser$UnlabelledAstNode(
																					_user$project$Parser_Parser$AstLeaf('-')),
																				_1: {
																					ctor: '::',
																					_0: _user$project$Parser_Parser$UnlabelledAstNode(
																						_user$project$Parser_Parser$AstLeaf('name')),
																					_1: {ctor: '[]'}
																				}
																			}
																		})),
																_1: {
																	ctor: '::',
																	_0: _user$project$Parser_Parser$UnlabelledAstNode(
																		_user$project$Parser_Parser$AstChildren(
																			{
																				ctor: '::',
																				_0: _user$project$Parser_Parser$UnlabelledAstNode(
																					_user$project$Parser_Parser$AstLeaf('elm')),
																				_1: {ctor: '[]'}
																			})),
																	_1: {ctor: '[]'}
																}
															})),
													_1: {ctor: '[]'}
												}))),
									_1: {ctor: '[]'}
								},
								_user$project$HtmlParser_HtmlParserRawAst$parseTagAttributes(
									_user$project$Parser_Tokenizer$tokenize(' data-name=\"elm\" ')))),
						_1: {
							ctor: '::',
							_0: A2(
								_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
								'parseClosingTag',
								A2(
									_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
									{
										ctor: '_Tuple2',
										_0: _user$project$Parser_Parser$ParseMatchesReturnsResult(_user$project$HtmlParser_HtmlParserRawAst$testClosingTagNode),
										_1: {ctor: '[]'}
									},
									_user$project$HtmlParser_HtmlParserRawAst$parseClosingTag(
										_user$project$Parser_Tokenizer$tokenize('</div>')))),
							_1: {
								ctor: '::',
								_0: A2(
									_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
									'parseOpeningTag no attributes',
									A2(
										_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
										{
											ctor: '_Tuple2',
											_0: _user$project$Parser_Parser$ParseMatchesReturnsResult(
												_user$project$Parser_Parser$LabelledAstNode(
													{
														label: 'OPENING_TAG',
														value: _user$project$Parser_Parser$AstChildren(
															{
																ctor: '::',
																_0: _user$project$Parser_Parser$UnlabelledAstNode(
																	_user$project$Parser_Parser$AstLeaf('div')),
																_1: {
																	ctor: '::',
																	_0: _user$project$Parser_Parser$UnlabelledAstNode(
																		_user$project$Parser_Parser$AstChildren(
																			{ctor: '[]'})),
																	_1: {ctor: '[]'}
																}
															})
													})),
											_1: {ctor: '[]'}
										},
										_user$project$HtmlParser_HtmlParserRawAst$parseOpeningTag(
											_user$project$Parser_Tokenizer$tokenize('<div >')))),
								_1: {
									ctor: '::',
									_0: A2(
										_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
										'parseOpeningTag one attribute',
										A2(
											_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
											{
												ctor: '_Tuple2',
												_0: _user$project$Parser_Parser$ParseMatchesReturnsResult(_user$project$HtmlParser_HtmlParserRawAst$testOpeningTagNode),
												_1: {ctor: '[]'}
											},
											_user$project$HtmlParser_HtmlParserRawAst$parseOpeningTag(
												_user$project$Parser_Tokenizer$tokenize('<div id=\"1\" class=\"success awesome\">')))),
									_1: {
										ctor: '::',
										_0: A2(
											_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
											'parseSelfClosingTag',
											A2(
												_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
												{
													ctor: '_Tuple2',
													_0: _user$project$Parser_Parser$ParseMatchesReturnsResult(_user$project$HtmlParser_HtmlParserRawAst$testSelfClosingTagNode),
													_1: {ctor: '[]'}
												},
												_user$project$HtmlParser_HtmlParserRawAst$parseSelfClosingTag(
													_user$project$Parser_Tokenizer$tokenize('<img id=\"1\" class=\"success awesome\" />')))),
										_1: {
											ctor: '::',
											_0: A2(
												_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
												'parseTextNode',
												A2(
													_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
													{
														ctor: '_Tuple2',
														_0: _user$project$Parser_Parser$ParseMatchesReturnsResult(_user$project$HtmlParser_HtmlParserRawAst$testTextNode),
														_1: {ctor: '[]'}
													},
													_user$project$HtmlParser_HtmlParserRawAst$parseTextNode(
														_user$project$Parser_Tokenizer$tokenize('one two')))),
											_1: {
												ctor: '::',
												_0: A2(
													_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
													'parseTextNode',
													A2(
														_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
														{
															ctor: '_Tuple2',
															_0: _user$project$Parser_Parser$ParseDoesNotMatch,
															_1: {
																ctor: '::',
																_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$LeftAngleBracket, _1: '<'},
																_1: {ctor: '[]'}
															}
														},
														_user$project$HtmlParser_HtmlParserRawAst$parseTextNode(
															_user$project$Parser_Tokenizer$tokenize('<')))),
												_1: {
													ctor: '::',
													_0: A2(
														_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
														'parseTextNode',
														A2(
															_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
															{
																ctor: '_Tuple2',
																_0: _user$project$Parser_Parser$ParseMatchesReturnsResult(
																	_user$project$Parser_Parser$LabelledAstNode(
																		{
																			label: 'TEXT',
																			value: _user$project$Parser_Parser$AstChildren(
																				{
																					ctor: '::',
																					_0: _user$project$Parser_Parser$UnlabelledAstNode(
																						_user$project$Parser_Parser$AstLeaf(' ')),
																					_1: {ctor: '[]'}
																				})
																		})),
																_1: {
																	ctor: '::',
																	_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$LeftAngleBracket, _1: '<'},
																	_1: {ctor: '[]'}
																}
															},
															_user$project$HtmlParser_HtmlParserRawAst$parseTextNode(
																{
																	ctor: '::',
																	_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$Whitespace, _1: ' '},
																	_1: {
																		ctor: '::',
																		_0: {ctor: '_Tuple2', _0: _user$project$Parser_Tokenizer$LeftAngleBracket, _1: '<'},
																		_1: {ctor: '[]'}
																	}
																}))),
													_1: {
														ctor: '::',
														_0: A2(
															_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
															'parseHtmlTokens',
															A2(
																_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
																{
																	ctor: '_Tuple2',
																	_0: _user$project$Parser_Parser$ParseMatchesReturnsResult(
																		_user$project$Parser_Parser$UnlabelledAstNode(
																			_user$project$Parser_Parser$AstChildren(
																				{
																					ctor: '::',
																					_0: _user$project$HtmlParser_HtmlParserRawAst$testOpeningTagNode,
																					_1: {
																						ctor: '::',
																						_0: _user$project$HtmlParser_HtmlParserRawAst$testTextNode,
																						_1: {
																							ctor: '::',
																							_0: _user$project$HtmlParser_HtmlParserRawAst$testClosingTagNode,
																							_1: {
																								ctor: '::',
																								_0: _user$project$HtmlParser_HtmlParserRawAst$testClosingTagNode,
																								_1: {
																									ctor: '::',
																									_0: _user$project$HtmlParser_HtmlParserRawAst$testTextNode,
																									_1: {
																										ctor: '::',
																										_0: _user$project$HtmlParser_HtmlParserRawAst$testOpeningTagNode,
																										_1: {ctor: '[]'}
																									}
																								}
																							}
																						}
																					}
																				}))),
																	_1: {ctor: '[]'}
																},
																_user$project$HtmlParser_HtmlParserRawAst$parseHtmlTokens(
																	_user$project$Parser_Tokenizer$tokenize(' <div id=\"1\" class=\"success awesome\" >one two</div></div>one two<div id=\"1\" class=\"success awesome\" > ')))),
														_1: {
															ctor: '::',
															_0: A2(
																_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
																'parseComment',
																A2(
																	_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
																	{
																		ctor: '_Tuple2',
																		_0: _user$project$Parser_Parser$ParseMatchesReturnsNothing,
																		_1: {ctor: '[]'}
																	},
																	_user$project$HtmlParser_HtmlParserRawAst$parseComment(
																		_user$project$Parser_Tokenizer$tokenize('<!--hello world-->')))),
															_1: {
																ctor: '::',
																_0: A2(
																	_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
																	'parse empty string',
																	A2(
																		_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
																		{
																			ctor: '_Tuple2',
																			_0: _user$project$Parser_Parser$ParseDoesNotMatch,
																			_1: {ctor: '[]'}
																		},
																		_user$project$HtmlParser_HtmlParserRawAst$parseHtmlTokens(
																			_user$project$Parser_Tokenizer$tokenize('')))),
																_1: {ctor: '[]'}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	});
var _user$project$HtmlParser_HtmlParserRawAst$main = _rtfeldman$legacy_elm_test$Legacy_ElmTest$runSuiteHtml(_user$project$HtmlParser_HtmlParserRawAst$tests)();

var _user$project$HtmlParser_HtmlParser$simpleHtmlResult = _user$project$HtmlParser_HtmlParserRawAst$xhtmlToRawAst('<h1>hello world</h1>');
var _user$project$HtmlParser_HtmlParser$assumeSuccess = function (x) {
	var _p0 = x;
	if (_p0.ctor === 'Just') {
		return _p0._0;
	} else {
		return _elm_lang$core$Native_Utils.crashCase(
			'HtmlParser.HtmlParser',
			{
				start: {line: 329, column: 5},
				end: {line: 331, column: 29}
			},
			_p0)('');
	}
};
var _user$project$HtmlParser_HtmlParser$assumeParseSuccess = function (parseResult) {
	var _p2 = parseResult;
	if (_p2.ctor === 'ParseMatchesReturnsResult') {
		return _p2._0;
	} else {
		return _elm_lang$core$Native_Utils.crashCase(
			'HtmlParser.HtmlParser',
			{
				start: {line: 323, column: 5},
				end: {line: 325, column: 29}
			},
			_p2)('');
	}
};
var _user$project$HtmlParser_HtmlParser$simpleHtmlAstNode = _user$project$HtmlParser_HtmlParser$assumeParseSuccess(_user$project$HtmlParser_HtmlParser$simpleHtmlResult);
var _user$project$HtmlParser_HtmlParser$nestedHtmlAstNode = _user$project$HtmlParser_HtmlParser$assumeParseSuccess(
	_user$project$HtmlParser_HtmlParserRawAst$xhtmlToRawAst('<div><h1>hello world</h1></div>'));
var _user$project$HtmlParser_HtmlParser$testAttribute3 = _user$project$Parser_Parser$UnlabelledAstNode(
	_user$project$Parser_Parser$AstChildren(
		{
			ctor: '::',
			_0: _user$project$Parser_Parser$UnlabelledAstNode(
				_user$project$Parser_Parser$AstChildren(
					{
						ctor: '::',
						_0: _user$project$Parser_Parser$UnlabelledAstNode(
							_user$project$Parser_Parser$AstLeaf('data')),
						_1: {
							ctor: '::',
							_0: _user$project$Parser_Parser$UnlabelledAstNode(
								_user$project$Parser_Parser$AstLeaf('-')),
							_1: {
								ctor: '::',
								_0: _user$project$Parser_Parser$UnlabelledAstNode(
									_user$project$Parser_Parser$AstLeaf('name')),
								_1: {ctor: '[]'}
							}
						}
					})),
			_1: {
				ctor: '::',
				_0: _user$project$Parser_Parser$UnlabelledAstNode(
					_user$project$Parser_Parser$AstChildren(
						{
							ctor: '::',
							_0: _user$project$Parser_Parser$UnlabelledAstNode(
								_user$project$Parser_Parser$AstLeaf('elm')),
							_1: {ctor: '[]'}
						})),
				_1: {ctor: '[]'}
			}
		}));
var _user$project$HtmlParser_HtmlParser$testAttributes2 = _user$project$Parser_Parser$UnlabelledAstNode(
	_user$project$Parser_Parser$AstChildren(
		{
			ctor: '::',
			_0: _user$project$HtmlParser_HtmlParser$testAttribute3,
			_1: {ctor: '[]'}
		}));
var _user$project$HtmlParser_HtmlParser$testAttribute2 = _user$project$Parser_Parser$UnlabelledAstNode(
	_user$project$Parser_Parser$AstChildren(
		{
			ctor: '::',
			_0: _user$project$Parser_Parser$UnlabelledAstNode(
				_user$project$Parser_Parser$AstChildren(
					{
						ctor: '::',
						_0: _user$project$Parser_Parser$UnlabelledAstNode(
							_user$project$Parser_Parser$AstLeaf('id')),
						_1: {ctor: '[]'}
					})),
			_1: {
				ctor: '::',
				_0: _user$project$Parser_Parser$UnlabelledAstNode(
					_user$project$Parser_Parser$AstChildren(
						{
							ctor: '::',
							_0: _user$project$Parser_Parser$UnlabelledAstNode(
								_user$project$Parser_Parser$AstLeaf('1')),
							_1: {ctor: '[]'}
						})),
				_1: {ctor: '[]'}
			}
		}));
var _user$project$HtmlParser_HtmlParser$testAttribute1 = _user$project$Parser_Parser$UnlabelledAstNode(
	_user$project$Parser_Parser$AstChildren(
		{
			ctor: '::',
			_0: _user$project$Parser_Parser$UnlabelledAstNode(
				_user$project$Parser_Parser$AstChildren(
					{
						ctor: '::',
						_0: _user$project$Parser_Parser$UnlabelledAstNode(
							_user$project$Parser_Parser$AstLeaf('class')),
						_1: {ctor: '[]'}
					})),
			_1: {
				ctor: '::',
				_0: _user$project$Parser_Parser$UnlabelledAstNode(
					_user$project$Parser_Parser$AstChildren(
						{
							ctor: '::',
							_0: _user$project$Parser_Parser$UnlabelledAstNode(
								_user$project$Parser_Parser$AstLeaf('success')),
							_1: {
								ctor: '::',
								_0: _user$project$Parser_Parser$UnlabelledAstNode(
									_user$project$Parser_Parser$AstLeaf(' ')),
								_1: {
									ctor: '::',
									_0: _user$project$Parser_Parser$UnlabelledAstNode(
										_user$project$Parser_Parser$AstLeaf('awesome')),
									_1: {ctor: '[]'}
								}
							}
						})),
				_1: {ctor: '[]'}
			}
		}));
var _user$project$HtmlParser_HtmlParser$testAttributes = _user$project$Parser_Parser$UnlabelledAstNode(
	_user$project$Parser_Parser$AstChildren(
		{
			ctor: '::',
			_0: _user$project$HtmlParser_HtmlParser$testAttribute1,
			_1: {
				ctor: '::',
				_0: _user$project$HtmlParser_HtmlParser$testAttribute2,
				_1: {ctor: '[]'}
			}
		}));
var _user$project$HtmlParser_HtmlParser$testOpeningTag = _user$project$Parser_Parser$LabelledAstNode(
	{
		label: 'OPENING_TAG',
		value: _user$project$Parser_Parser$AstChildren(
			{
				ctor: '::',
				_0: _user$project$Parser_Parser$UnlabelledAstNode(
					_user$project$Parser_Parser$AstLeaf('div')),
				_1: {
					ctor: '::',
					_0: _user$project$HtmlParser_HtmlParser$testAttributes,
					_1: {ctor: '[]'}
				}
			})
	});
var _user$project$HtmlParser_HtmlParser$getTagName = function (astNode) {
	var _p4 = _user$project$Parser_ParserHelpers$listToPair(
		_user$project$Parser_ParserHelpers$unpackListFromNode(astNode));
	var tagNameNode = _p4._0;
	var attributesNode = _p4._1;
	return _user$project$Parser_ParserHelpers$unpackStringFromNode(tagNameNode);
};
var _user$project$HtmlParser_HtmlParser$attributeToTuple = function (astNode) {
	var strings = _user$project$Parser_ParserHelpers$unpackStringsFromNode(astNode);
	return _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$List$length(strings),
		1) ? _user$project$Parser_ParserHelpers$listToPair(
		A2(
			_elm_lang$core$Basics_ops['++'],
			strings,
			{
				ctor: '::',
				_0: '',
				_1: {ctor: '[]'}
			})) : _user$project$Parser_ParserHelpers$listToPair(strings);
};
var _user$project$HtmlParser_HtmlParser$attributesToDict = function (astNode) {
	var attributes = A2(
		_elm_lang$core$List$map,
		_user$project$HtmlParser_HtmlParser$attributeToTuple,
		_user$project$Parser_ParserHelpers$unpackListFromNode(astNode));
	return _elm_lang$core$Dict$fromList(attributes);
};
var _user$project$HtmlParser_HtmlParser$voidElements = {
	ctor: '::',
	_0: 'area',
	_1: {
		ctor: '::',
		_0: 'base',
		_1: {
			ctor: '::',
			_0: 'br',
			_1: {
				ctor: '::',
				_0: 'col',
				_1: {
					ctor: '::',
					_0: 'embed',
					_1: {
						ctor: '::',
						_0: 'hr',
						_1: {
							ctor: '::',
							_0: 'img',
							_1: {
								ctor: '::',
								_0: 'input',
								_1: {
									ctor: '::',
									_0: 'keygen',
									_1: {
										ctor: '::',
										_0: 'link',
										_1: {
											ctor: '::',
											_0: 'menuitem',
											_1: {
												ctor: '::',
												_0: 'meta',
												_1: {
													ctor: '::',
													_0: 'param',
													_1: {
														ctor: '::',
														_0: 'source',
														_1: {
															ctor: '::',
															_0: 'track',
															_1: {
																ctor: '::',
																_0: 'wbr',
																_1: {ctor: '[]'}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
};
var _user$project$HtmlParser_HtmlParser$Text = function (a) {
	return {ctor: 'Text', _0: a};
};
var _user$project$HtmlParser_HtmlParser$convertTextNode = function (astNode) {
	return _user$project$HtmlParser_HtmlParser$Text(
		_user$project$Parser_ParserHelpers$concatLeafs(astNode));
};
var _user$project$HtmlParser_HtmlParser$convertAttributeValue = function (astNode) {
	return _user$project$HtmlParser_HtmlParser$Text(
		_user$project$Parser_ParserHelpers$concatLeafs(astNode));
};
var _user$project$HtmlParser_HtmlParser$Element = function (a) {
	return {ctor: 'Element', _0: a};
};
var _user$project$HtmlParser_HtmlParser$convertOpeningTag = function (astNode) {
	var _p5 = _user$project$Parser_ParserHelpers$listToPair(
		_user$project$Parser_ParserHelpers$unpackListFromNode(astNode));
	var tagNameNode = _p5._0;
	var attributesNode = _p5._1;
	return _user$project$HtmlParser_HtmlParser$Element(
		{
			tagName: _user$project$Parser_ParserHelpers$unpackStringFromNode(tagNameNode),
			attributes: _user$project$HtmlParser_HtmlParser$attributesToDict(attributesNode),
			children: {ctor: '[]'}
		});
};
var _user$project$HtmlParser_HtmlParser$convertSelfClosingTag = _user$project$HtmlParser_HtmlParser$convertOpeningTag;
var _user$project$HtmlParser_HtmlParser$appendNode = F2(
	function (node, childNode) {
		var _p6 = node;
		if (_p6.ctor === 'Element') {
			var _p7 = _p6._0;
			return _user$project$HtmlParser_HtmlParser$Element(
				_elm_lang$core$Native_Utils.update(
					_p7,
					{
						children: A2(
							_elm_lang$core$Basics_ops['++'],
							_p7.children,
							{
								ctor: '::',
								_0: childNode,
								_1: {ctor: '[]'}
							})
					}));
		} else {
			return node;
		}
	});
var _user$project$HtmlParser_HtmlParser$TextAstNode = {ctor: 'TextAstNode'};
var _user$project$HtmlParser_HtmlParser$SelfClosingTagAstNode = {ctor: 'SelfClosingTagAstNode'};
var _user$project$HtmlParser_HtmlParser$ClosingTagAstNode = {ctor: 'ClosingTagAstNode'};
var _user$project$HtmlParser_HtmlParser$OpeningTagAstNode = {ctor: 'OpeningTagAstNode'};
var _user$project$HtmlParser_HtmlParser$astNodeTypeLookup = _elm_lang$core$Dict$fromList(
	{
		ctor: '::',
		_0: {ctor: '_Tuple2', _0: 'OPENING_TAG', _1: _user$project$HtmlParser_HtmlParser$OpeningTagAstNode},
		_1: {
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: 'CLOSING_TAG', _1: _user$project$HtmlParser_HtmlParser$ClosingTagAstNode},
			_1: {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 'TEXT', _1: _user$project$HtmlParser_HtmlParser$TextAstNode},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'SELF_CLOSING_TAG', _1: _user$project$HtmlParser_HtmlParser$SelfClosingTagAstNode},
					_1: {ctor: '[]'}
				}
			}
		}
	});
var _user$project$HtmlParser_HtmlParser$getAstNodeType = function (astNode) {
	var label = _user$project$Parser_ParserHelpers$getLabel(astNode);
	var _p8 = A2(_elm_lang$core$Dict$get, label, _user$project$HtmlParser_HtmlParser$astNodeTypeLookup);
	if (_p8.ctor === 'Just') {
		var _p10 = _p8._0;
		var _p9 = _p10;
		if (_p9.ctor === 'OpeningTagAstNode') {
			return A2(
				_elm_lang$core$List$member,
				_user$project$HtmlParser_HtmlParser$getTagName(astNode),
				_user$project$HtmlParser_HtmlParser$voidElements) ? _user$project$HtmlParser_HtmlParser$SelfClosingTagAstNode : _user$project$HtmlParser_HtmlParser$OpeningTagAstNode;
		} else {
			return _p10;
		}
	} else {
		return _elm_lang$core$Native_Utils.crashCase(
			'HtmlParser.HtmlParser',
			{
				start: {line: 160, column: 9},
				end: {line: 173, column: 32}
			},
			_p8)('');
	}
};
var _user$project$HtmlParser_HtmlParser$flatAstToTree = F2(
	function (openingTagAstNode, astNodes) {
		var flatAstToTree_ = F2(
			function (currNode, remainderAstNodes) {
				flatAstToTree_:
				while (true) {
					var _p12 = remainderAstNodes;
					if (_p12.ctor === '[]') {
						return {
							ctor: '_Tuple2',
							_0: currNode,
							_1: {ctor: '[]'}
						};
					} else {
						var _p16 = _p12._1;
						var _p15 = _p12._0;
						var _p13 = _user$project$HtmlParser_HtmlParser$getAstNodeType(_p15);
						switch (_p13.ctor) {
							case 'TextAstNode':
								var newNode = A2(
									_user$project$HtmlParser_HtmlParser$appendNode,
									currNode,
									_user$project$HtmlParser_HtmlParser$convertTextNode(_p15));
								var _v7 = newNode,
									_v8 = _p16;
								currNode = _v7;
								remainderAstNodes = _v8;
								continue flatAstToTree_;
							case 'OpeningTagAstNode':
								var _p14 = A2(_user$project$HtmlParser_HtmlParser$flatAstToTree, _p15, _p16);
								var elementNode = _p14._0;
								var remainderAstNodes_ = _p14._1;
								var newNode = A2(_user$project$HtmlParser_HtmlParser$appendNode, currNode, elementNode);
								var _v9 = newNode,
									_v10 = remainderAstNodes_;
								currNode = _v9;
								remainderAstNodes = _v10;
								continue flatAstToTree_;
							case 'ClosingTagAstNode':
								return {ctor: '_Tuple2', _0: currNode, _1: _p16};
							default:
								var newNode = A2(
									_user$project$HtmlParser_HtmlParser$appendNode,
									currNode,
									_user$project$HtmlParser_HtmlParser$convertSelfClosingTag(_p15));
								var _v11 = newNode,
									_v12 = _p16;
								currNode = _v11;
								remainderAstNodes = _v12;
								continue flatAstToTree_;
						}
					}
				}
			});
		var initialNode = _user$project$HtmlParser_HtmlParser$convertOpeningTag(openingTagAstNode);
		var result = A2(flatAstToTree_, initialNode, astNodes);
		return result;
	});
var _user$project$HtmlParser_HtmlParser$astNodeToHtmlNode = function (astNode) {
	var astNodes = _user$project$Parser_ParserHelpers$unpackListFromNode(astNode);
	var headNode = _user$project$Parser_ParserHelpers$unsafeHead(astNodes);
	var tailNodes = _user$project$Parser_ParserHelpers$unsafeTail(astNodes);
	var _p17 = astNodes;
	if (_p17.ctor === '[]') {
		return _elm_lang$core$Maybe$Nothing;
	} else {
		var _p20 = _p17._0;
		var _p18 = _user$project$HtmlParser_HtmlParser$getAstNodeType(_p20);
		if (_p18.ctor === 'OpeningTagAstNode') {
			var _p19 = A2(_user$project$HtmlParser_HtmlParser$flatAstToTree, _p20, _p17._1);
			var node = _p19._0;
			return _elm_lang$core$Maybe$Just(node);
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	}
};
var _user$project$HtmlParser_HtmlParser$parseHtml = function (s) {
	var result = _user$project$HtmlParser_HtmlParserRawAst$xhtmlToRawAst(s);
	var _p21 = _user$project$HtmlParser_HtmlParserRawAst$xhtmlToRawAst(s);
	switch (_p21.ctor) {
		case 'ParseDoesNotMatch':
			return _elm_lang$core$Maybe$Nothing;
		case 'ParseMatchesReturnsResult':
			return _user$project$HtmlParser_HtmlParser$astNodeToHtmlNode(_p21._0);
		default:
			return _elm_lang$core$Native_Utils.crashCase(
				'HtmlParser.HtmlParser',
				{
					start: {line: 244, column: 9},
					end: {line: 249, column: 33}
				},
				_p21)('');
	}
};
var _user$project$HtmlParser_HtmlParser$tests = A2(
	_rtfeldman$legacy_elm_test$Legacy_ElmTest$suite,
	'HtmlParser.elm',
	{
		ctor: '::',
		_0: A2(
			_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
			'attributesToDict',
			A2(
				_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
				{ctor: '_Tuple2', _0: 'class', _1: 'success awesome'},
				_user$project$HtmlParser_HtmlParser$attributeToTuple(_user$project$HtmlParser_HtmlParser$testAttribute1))),
		_1: {
			ctor: '::',
			_0: A2(
				_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
				'attributeToTuple',
				A2(
					_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
					_elm_lang$core$Dict$fromList(
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'class', _1: 'success awesome'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'id', _1: '1'},
								_1: {ctor: '[]'}
							}
						}),
					_user$project$HtmlParser_HtmlParser$attributesToDict(_user$project$HtmlParser_HtmlParser$testAttributes))),
			_1: {
				ctor: '::',
				_0: A2(
					_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
					'attributeToTuple (dashed)',
					A2(
						_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
						_elm_lang$core$Dict$fromList(
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'data-name', _1: 'elm'},
								_1: {ctor: '[]'}
							}),
						_user$project$HtmlParser_HtmlParser$attributesToDict(_user$project$HtmlParser_HtmlParser$testAttributes2))),
				_1: {
					ctor: '::',
					_0: A2(
						_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
						'convertOpeningTag',
						A2(
							_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
							_user$project$HtmlParser_HtmlParser$Element(
								{
									tagName: 'div',
									attributes: _elm_lang$core$Dict$fromList(
										{
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'class', _1: 'success awesome'},
											_1: {
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'id', _1: '1'},
												_1: {ctor: '[]'}
											}
										}),
									children: {ctor: '[]'}
								}),
							_user$project$HtmlParser_HtmlParser$convertOpeningTag(_user$project$HtmlParser_HtmlParser$testOpeningTag))),
					_1: {
						ctor: '::',
						_0: A2(
							_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
							'appendNode',
							A2(
								_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
								_user$project$HtmlParser_HtmlParser$Element(
									{
										tagName: 'div',
										attributes: _elm_lang$core$Dict$fromList(
											{ctor: '[]'}),
										children: {
											ctor: '::',
											_0: _user$project$HtmlParser_HtmlParser$Text('hello'),
											_1: {ctor: '[]'}
										}
									}),
								A2(
									_user$project$HtmlParser_HtmlParser$appendNode,
									_user$project$HtmlParser_HtmlParser$Element(
										{
											tagName: 'div',
											attributes: _elm_lang$core$Dict$fromList(
												{ctor: '[]'}),
											children: {ctor: '[]'}
										}),
									_user$project$HtmlParser_HtmlParser$Text('hello')))),
						_1: {
							ctor: '::',
							_0: A2(
								_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
								'getAstNodeType',
								A2(
									_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
									_user$project$HtmlParser_HtmlParser$OpeningTagAstNode,
									_user$project$HtmlParser_HtmlParser$getAstNodeType(_user$project$HtmlParser_HtmlParser$testOpeningTag))),
							_1: {
								ctor: '::',
								_0: A2(
									_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
									'astNodeToHtmlNode',
									A2(
										_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
										_user$project$HtmlParser_HtmlParser$Element(
											{
												tagName: 'h1',
												attributes: _elm_lang$core$Dict$empty,
												children: {
													ctor: '::',
													_0: _user$project$HtmlParser_HtmlParser$Text('hello world'),
													_1: {ctor: '[]'}
												}
											}),
										_user$project$HtmlParser_HtmlParser$assumeSuccess(
											_user$project$HtmlParser_HtmlParser$astNodeToHtmlNode(_user$project$HtmlParser_HtmlParser$simpleHtmlAstNode)))),
								_1: {
									ctor: '::',
									_0: A2(
										_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
										'testNestedHtml',
										A2(
											_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
											_user$project$HtmlParser_HtmlParser$Element(
												{
													tagName: 'div',
													attributes: _elm_lang$core$Dict$empty,
													children: {
														ctor: '::',
														_0: _user$project$HtmlParser_HtmlParser$Element(
															{
																tagName: 'h1',
																attributes: _elm_lang$core$Dict$empty,
																children: {
																	ctor: '::',
																	_0: _user$project$HtmlParser_HtmlParser$Text('hello world'),
																	_1: {ctor: '[]'}
																}
															}),
														_1: {ctor: '[]'}
													}
												}),
											_user$project$HtmlParser_HtmlParser$assumeSuccess(
												_user$project$HtmlParser_HtmlParser$astNodeToHtmlNode(_user$project$HtmlParser_HtmlParser$nestedHtmlAstNode)))),
									_1: {
										ctor: '::',
										_0: A2(
											_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
											'testSelfClosing',
											A2(
												_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
												_user$project$HtmlParser_HtmlParser$Element(
													{
														tagName: 'div',
														attributes: _elm_lang$core$Dict$fromList(
															{ctor: '[]'}),
														children: {
															ctor: '::',
															_0: _user$project$HtmlParser_HtmlParser$Element(
																{
																	tagName: 'img',
																	attributes: _elm_lang$core$Dict$fromList(
																		{
																			ctor: '::',
																			_0: {ctor: '_Tuple2', _0: 'src', _1: 'test.jpg'},
																			_1: {ctor: '[]'}
																		}),
																	children: {ctor: '[]'}
																}),
															_1: {ctor: '[]'}
														}
													}),
												_user$project$HtmlParser_HtmlParser$assumeSuccess(
													_user$project$HtmlParser_HtmlParser$astNodeToHtmlNode(
														_user$project$HtmlParser_HtmlParser$assumeParseSuccess(
															_user$project$HtmlParser_HtmlParserRawAst$xhtmlToRawAst('<div><img src=\"test.jpg\"/></div>')))))),
										_1: {
											ctor: '::',
											_0: A2(
												_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
												'boolean attribute',
												A2(
													_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
													_user$project$HtmlParser_HtmlParser$Element(
														{
															tagName: 'div',
															attributes: _elm_lang$core$Dict$fromList(
																{
																	ctor: '::',
																	_0: {ctor: '_Tuple2', _0: 'disabled', _1: ''},
																	_1: {ctor: '[]'}
																}),
															children: {ctor: '[]'}
														}),
													_user$project$HtmlParser_HtmlParser$assumeSuccess(
														_user$project$HtmlParser_HtmlParser$astNodeToHtmlNode(
															_user$project$HtmlParser_HtmlParser$assumeParseSuccess(
																_user$project$HtmlParser_HtmlParserRawAst$xhtmlToRawAst('<div disabled></div>')))))),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	});
var _user$project$HtmlParser_HtmlParser$main = _rtfeldman$legacy_elm_test$Legacy_ElmTest$runSuiteHtml(_user$project$HtmlParser_HtmlParser$tests)();

var _user$project$HtmlToElm_ElmHtmlWhitelists$reservedWords = {
	ctor: '::',
	_0: 'main',
	_1: {
		ctor: '::',
		_0: 'type',
		_1: {ctor: '[]'}
	}
};
var _user$project$HtmlToElm_ElmHtmlWhitelists$intAttributeFunctions = {
	ctor: '::',
	_0: 'maxlength',
	_1: {
		ctor: '::',
		_0: 'minlength',
		_1: {
			ctor: '::',
			_0: 'size',
			_1: {
				ctor: '::',
				_0: 'cols',
				_1: {
					ctor: '::',
					_0: 'rows',
					_1: {
						ctor: '::',
						_0: 'height',
						_1: {
							ctor: '::',
							_0: 'width',
							_1: {
								ctor: '::',
								_0: 'start',
								_1: {
									ctor: '::',
									_0: 'colspan',
									_1: {
										ctor: '::',
										_0: 'rowspan',
										_1: {
											ctor: '::',
											_0: 'tabindex',
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
};
var _user$project$HtmlToElm_ElmHtmlWhitelists$boolAttributeFunctions = {
	ctor: '::',
	_0: 'hidden',
	_1: {
		ctor: '::',
		_0: 'checked',
		_1: {
			ctor: '::',
			_0: 'selected',
			_1: {
				ctor: '::',
				_0: 'autocomplete',
				_1: {
					ctor: '::',
					_0: 'autofocus',
					_1: {
						ctor: '::',
						_0: 'disabled',
						_1: {
							ctor: '::',
							_0: 'multiple',
							_1: {
								ctor: '::',
								_0: 'novalidate',
								_1: {
									ctor: '::',
									_0: 'readonly',
									_1: {
										ctor: '::',
										_0: 'required',
										_1: {
											ctor: '::',
											_0: 'download',
											_1: {
												ctor: '::',
												_0: 'ismap',
												_1: {
													ctor: '::',
													_0: 'autoplay',
													_1: {
														ctor: '::',
														_0: 'controls',
														_1: {
															ctor: '::',
															_0: 'loop',
															_1: {
																ctor: '::',
																_0: 'default',
																_1: {
																	ctor: '::',
																	_0: 'seamless',
																	_1: {
																		ctor: '::',
																		_0: 'reversed',
																		_1: {
																			ctor: '::',
																			_0: 'async',
																			_1: {
																				ctor: '::',
																				_0: 'defer',
																				_1: {
																					ctor: '::',
																					_0: 'scoped',
																					_1: {
																						ctor: '::',
																						_0: 'contenteditable',
																						_1: {
																							ctor: '::',
																							_0: 'spellcheck',
																							_1: {ctor: '[]'}
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
};
var _user$project$HtmlToElm_ElmHtmlWhitelists$implementedAttributeFunctions = {
	ctor: '::',
	_0: 'key',
	_1: {
		ctor: '::',
		_0: 'class',
		_1: {
			ctor: '::',
			_0: 'classList',
			_1: {
				ctor: '::',
				_0: 'id',
				_1: {
					ctor: '::',
					_0: 'title',
					_1: {
						ctor: '::',
						_0: 'type_',
						_1: {
							ctor: '::',
							_0: 'value',
							_1: {
								ctor: '::',
								_0: 'placeholder',
								_1: {
									ctor: '::',
									_0: 'accept',
									_1: {
										ctor: '::',
										_0: 'acceptCharset',
										_1: {
											ctor: '::',
											_0: 'action',
											_1: {
												ctor: '::',
												_0: 'autosave',
												_1: {
													ctor: '::',
													_0: 'enctype',
													_1: {
														ctor: '::',
														_0: 'formaction',
														_1: {
															ctor: '::',
															_0: 'list',
															_1: {
																ctor: '::',
																_0: 'method',
																_1: {
																	ctor: '::',
																	_0: 'name',
																	_1: {
																		ctor: '::',
																		_0: 'pattern',
																		_1: {
																			ctor: '::',
																			_0: 'for',
																			_1: {
																				ctor: '::',
																				_0: 'form',
																				_1: {
																					ctor: '::',
																					_0: 'max',
																					_1: {
																						ctor: '::',
																						_0: 'min',
																						_1: {
																							ctor: '::',
																							_0: 'step',
																							_1: {
																								ctor: '::',
																								_0: 'wrap',
																								_1: {
																									ctor: '::',
																									_0: 'href',
																									_1: {
																										ctor: '::',
																										_0: 'target',
																										_1: {
																											ctor: '::',
																											_0: 'downloadAs',
																											_1: {
																												ctor: '::',
																												_0: 'hreflang',
																												_1: {
																													ctor: '::',
																													_0: 'media',
																													_1: {
																														ctor: '::',
																														_0: 'ping',
																														_1: {
																															ctor: '::',
																															_0: 'rel',
																															_1: {
																																ctor: '::',
																																_0: 'usemap',
																																_1: {
																																	ctor: '::',
																																	_0: 'shape',
																																	_1: {
																																		ctor: '::',
																																		_0: 'coords',
																																		_1: {
																																			ctor: '::',
																																			_0: 'src',
																																			_1: {
																																				ctor: '::',
																																				_0: 'alt',
																																				_1: {
																																					ctor: '::',
																																					_0: 'preload',
																																					_1: {
																																						ctor: '::',
																																						_0: 'poster',
																																						_1: {
																																							ctor: '::',
																																							_0: 'kind',
																																							_1: {
																																								ctor: '::',
																																								_0: 'srclang',
																																								_1: {
																																									ctor: '::',
																																									_0: 'sandbox',
																																									_1: {
																																										ctor: '::',
																																										_0: 'srcdoc',
																																										_1: {
																																											ctor: '::',
																																											_0: 'align',
																																											_1: {
																																												ctor: '::',
																																												_0: 'headers',
																																												_1: {
																																													ctor: '::',
																																													_0: 'scope',
																																													_1: {
																																														ctor: '::',
																																														_0: 'charset',
																																														_1: {
																																															ctor: '::',
																																															_0: 'content',
																																															_1: {
																																																ctor: '::',
																																																_0: 'httpEquiv',
																																																_1: {
																																																	ctor: '::',
																																																	_0: 'language',
																																																	_1: {
																																																		ctor: '::',
																																																		_0: 'accesskey',
																																																		_1: {
																																																			ctor: '::',
																																																			_0: 'contextmenu',
																																																			_1: {
																																																				ctor: '::',
																																																				_0: 'dir',
																																																				_1: {
																																																					ctor: '::',
																																																					_0: 'draggable',
																																																					_1: {
																																																						ctor: '::',
																																																						_0: 'dropzone',
																																																						_1: {
																																																							ctor: '::',
																																																							_0: 'itemprop',
																																																							_1: {
																																																								ctor: '::',
																																																								_0: 'lang',
																																																								_1: {
																																																									ctor: '::',
																																																									_0: 'challenge',
																																																									_1: {
																																																										ctor: '::',
																																																										_0: 'keytype',
																																																										_1: {
																																																											ctor: '::',
																																																											_0: 'cite',
																																																											_1: {
																																																												ctor: '::',
																																																												_0: 'datetime',
																																																												_1: {
																																																													ctor: '::',
																																																													_0: 'pubdate',
																																																													_1: {
																																																														ctor: '::',
																																																														_0: 'manifest',
																																																														_1: {
																																																															ctor: '::',
																																																															_0: 'property',
																																																															_1: {
																																																																ctor: '::',
																																																																_0: 'attribute',
																																																																_1: {
																																																																	ctor: '::',
																																																																	_0: 'd',
																																																																	_1: {
																																																																		ctor: '::',
																																																																		_0: 'fill',
																																																																		_1: {
																																																																			ctor: '::',
																																																																			_0: 'viewBox',
																																																																			_1: {ctor: '[]'}
																																																																		}
																																																																	}
																																																																}
																																																															}
																																																														}
																																																													}
																																																												}
																																																											}
																																																										}
																																																									}
																																																								}
																																																							}
																																																						}
																																																					}
																																																				}
																																																			}
																																																		}
																																																	}
																																																}
																																															}
																																														}
																																													}
																																												}
																																											}
																																										}
																																									}
																																								}
																																							}
																																						}
																																					}
																																				}
																																			}
																																		}
																																	}
																																}
																															}
																														}
																													}
																												}
																											}
																										}
																									}
																								}
																							}
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
};
var _user$project$HtmlToElm_ElmHtmlWhitelists$implementedTagFunctions = {
	ctor: '::',
	_0: 'body',
	_1: {
		ctor: '::',
		_0: 'section',
		_1: {
			ctor: '::',
			_0: 'nav',
			_1: {
				ctor: '::',
				_0: 'article',
				_1: {
					ctor: '::',
					_0: 'aside',
					_1: {
						ctor: '::',
						_0: 'h1',
						_1: {
							ctor: '::',
							_0: 'h2',
							_1: {
								ctor: '::',
								_0: 'h3',
								_1: {
									ctor: '::',
									_0: 'h4',
									_1: {
										ctor: '::',
										_0: 'h5',
										_1: {
											ctor: '::',
											_0: 'h6',
											_1: {
												ctor: '::',
												_0: 'header',
												_1: {
													ctor: '::',
													_0: 'footer',
													_1: {
														ctor: '::',
														_0: 'address',
														_1: {
															ctor: '::',
															_0: 'p',
															_1: {
																ctor: '::',
																_0: 'hr',
																_1: {
																	ctor: '::',
																	_0: 'pre',
																	_1: {
																		ctor: '::',
																		_0: 'blockquote',
																		_1: {
																			ctor: '::',
																			_0: 'ol',
																			_1: {
																				ctor: '::',
																				_0: 'ul',
																				_1: {
																					ctor: '::',
																					_0: 'li',
																					_1: {
																						ctor: '::',
																						_0: 'dl',
																						_1: {
																							ctor: '::',
																							_0: 'dt',
																							_1: {
																								ctor: '::',
																								_0: 'dd',
																								_1: {
																									ctor: '::',
																									_0: 'figure',
																									_1: {
																										ctor: '::',
																										_0: 'figcaption',
																										_1: {
																											ctor: '::',
																											_0: 'div',
																											_1: {
																												ctor: '::',
																												_0: 'a',
																												_1: {
																													ctor: '::',
																													_0: 'em',
																													_1: {
																														ctor: '::',
																														_0: 'strong',
																														_1: {
																															ctor: '::',
																															_0: 'small',
																															_1: {
																																ctor: '::',
																																_0: 's',
																																_1: {
																																	ctor: '::',
																																	_0: 'cite',
																																	_1: {
																																		ctor: '::',
																																		_0: 'q',
																																		_1: {
																																			ctor: '::',
																																			_0: 'dfn',
																																			_1: {
																																				ctor: '::',
																																				_0: 'abbr',
																																				_1: {
																																					ctor: '::',
																																					_0: 'time',
																																					_1: {
																																						ctor: '::',
																																						_0: 'code',
																																						_1: {
																																							ctor: '::',
																																							_0: 'var',
																																							_1: {
																																								ctor: '::',
																																								_0: 'samp',
																																								_1: {
																																									ctor: '::',
																																									_0: 'kbd',
																																									_1: {
																																										ctor: '::',
																																										_0: 'sub',
																																										_1: {
																																											ctor: '::',
																																											_0: 'sup',
																																											_1: {
																																												ctor: '::',
																																												_0: 'i',
																																												_1: {
																																													ctor: '::',
																																													_0: 'b',
																																													_1: {
																																														ctor: '::',
																																														_0: 'u',
																																														_1: {
																																															ctor: '::',
																																															_0: 'mark',
																																															_1: {
																																																ctor: '::',
																																																_0: 'ruby',
																																																_1: {
																																																	ctor: '::',
																																																	_0: 'rt',
																																																	_1: {
																																																		ctor: '::',
																																																		_0: 'rp',
																																																		_1: {
																																																			ctor: '::',
																																																			_0: 'bdi',
																																																			_1: {
																																																				ctor: '::',
																																																				_0: 'bdo',
																																																				_1: {
																																																					ctor: '::',
																																																					_0: 'span',
																																																					_1: {
																																																						ctor: '::',
																																																						_0: 'br',
																																																						_1: {
																																																							ctor: '::',
																																																							_0: 'wbr',
																																																							_1: {
																																																								ctor: '::',
																																																								_0: 'ins',
																																																								_1: {
																																																									ctor: '::',
																																																									_0: 'del',
																																																									_1: {
																																																										ctor: '::',
																																																										_0: 'img',
																																																										_1: {
																																																											ctor: '::',
																																																											_0: 'iframe',
																																																											_1: {
																																																												ctor: '::',
																																																												_0: 'embed',
																																																												_1: {
																																																													ctor: '::',
																																																													_0: 'object',
																																																													_1: {
																																																														ctor: '::',
																																																														_0: 'param',
																																																														_1: {
																																																															ctor: '::',
																																																															_0: 'video',
																																																															_1: {
																																																																ctor: '::',
																																																																_0: 'audio',
																																																																_1: {
																																																																	ctor: '::',
																																																																	_0: 'source',
																																																																	_1: {
																																																																		ctor: '::',
																																																																		_0: 'track',
																																																																		_1: {
																																																																			ctor: '::',
																																																																			_0: 'canvas',
																																																																			_1: {
																																																																				ctor: '::',
																																																																				_0: 'svg',
																																																																				_1: {
																																																																					ctor: '::',
																																																																					_0: 'math',
																																																																					_1: {
																																																																						ctor: '::',
																																																																						_0: 'table',
																																																																						_1: {
																																																																							ctor: '::',
																																																																							_0: 'caption',
																																																																							_1: {
																																																																								ctor: '::',
																																																																								_0: 'colgroup',
																																																																								_1: {
																																																																									ctor: '::',
																																																																									_0: 'col',
																																																																									_1: {
																																																																										ctor: '::',
																																																																										_0: 'tbody',
																																																																										_1: {
																																																																											ctor: '::',
																																																																											_0: 'thead',
																																																																											_1: {
																																																																												ctor: '::',
																																																																												_0: 'tfoot',
																																																																												_1: {
																																																																													ctor: '::',
																																																																													_0: 'tr',
																																																																													_1: {
																																																																														ctor: '::',
																																																																														_0: 'td',
																																																																														_1: {
																																																																															ctor: '::',
																																																																															_0: 'th',
																																																																															_1: {
																																																																																ctor: '::',
																																																																																_0: 'form',
																																																																																_1: {
																																																																																	ctor: '::',
																																																																																	_0: 'fieldset',
																																																																																	_1: {
																																																																																		ctor: '::',
																																																																																		_0: 'legend',
																																																																																		_1: {
																																																																																			ctor: '::',
																																																																																			_0: 'label',
																																																																																			_1: {
																																																																																				ctor: '::',
																																																																																				_0: 'input',
																																																																																				_1: {
																																																																																					ctor: '::',
																																																																																					_0: 'button',
																																																																																					_1: {
																																																																																						ctor: '::',
																																																																																						_0: 'select',
																																																																																						_1: {
																																																																																							ctor: '::',
																																																																																							_0: 'datalist',
																																																																																							_1: {
																																																																																								ctor: '::',
																																																																																								_0: 'optgroup',
																																																																																								_1: {
																																																																																									ctor: '::',
																																																																																									_0: 'option',
																																																																																									_1: {
																																																																																										ctor: '::',
																																																																																										_0: 'textarea',
																																																																																										_1: {
																																																																																											ctor: '::',
																																																																																											_0: 'keygen',
																																																																																											_1: {
																																																																																												ctor: '::',
																																																																																												_0: 'output',
																																																																																												_1: {
																																																																																													ctor: '::',
																																																																																													_0: 'progress',
																																																																																													_1: {
																																																																																														ctor: '::',
																																																																																														_0: 'meter',
																																																																																														_1: {
																																																																																															ctor: '::',
																																																																																															_0: 'details',
																																																																																															_1: {
																																																																																																ctor: '::',
																																																																																																_0: 'summary',
																																																																																																_1: {
																																																																																																	ctor: '::',
																																																																																																	_0: 'menuitem',
																																																																																																	_1: {
																																																																																																		ctor: '::',
																																																																																																		_0: 'menu',
																																																																																																		_1: {
																																																																																																			ctor: '::',
																																																																																																			_0: 'defs',
																																																																																																			_1: {
																																																																																																				ctor: '::',
																																																																																																				_0: 'clipPath',
																																																																																																				_1: {
																																																																																																					ctor: '::',
																																																																																																					_0: 'path',
																																																																																																					_1: {
																																																																																																						ctor: '::',
																																																																																																						_0: 'g',
																																																																																																						_1: {ctor: '[]'}
																																																																																																					}
																																																																																																				}
																																																																																																			}
																																																																																																		}
																																																																																																	}
																																																																																																}
																																																																																															}
																																																																																														}
																																																																																													}
																																																																																												}
																																																																																											}
																																																																																										}
																																																																																									}
																																																																																								}
																																																																																							}
																																																																																						}
																																																																																					}
																																																																																				}
																																																																																			}
																																																																																		}
																																																																																	}
																																																																																}
																																																																															}
																																																																														}
																																																																													}
																																																																												}
																																																																											}
																																																																										}
																																																																									}
																																																																								}
																																																																							}
																																																																						}
																																																																					}
																																																																				}
																																																																			}
																																																																		}
																																																																	}
																																																																}
																																																															}
																																																														}
																																																													}
																																																												}
																																																											}
																																																										}
																																																									}
																																																								}
																																																							}
																																																						}
																																																					}
																																																				}
																																																			}
																																																		}
																																																	}
																																																}
																																															}
																																														}
																																													}
																																												}
																																											}
																																										}
																																									}
																																								}
																																							}
																																						}
																																					}
																																				}
																																			}
																																		}
																																	}
																																}
																															}
																														}
																													}
																												}
																											}
																										}
																									}
																								}
																							}
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
};

var _user$project$HtmlToElm_HtmlToElm$testAttributes = _elm_lang$core$Dict$fromList(
	{
		ctor: '::',
		_0: {ctor: '_Tuple2', _0: 'id', _1: '1'},
		_1: {
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: 'class', _1: 'success'},
			_1: {ctor: '[]'}
		}
	});
var _user$project$HtmlToElm_HtmlToElm$testLeafElement = _user$project$HtmlParser_HtmlParser$Element(
	{
		tagName: 'div',
		attributes: _user$project$HtmlToElm_HtmlToElm$testAttributes,
		children: {ctor: '[]'}
	});
var _user$project$HtmlToElm_HtmlToElm$testLeafElements = A2(_elm_lang$core$List$repeat, 3, _user$project$HtmlToElm_HtmlToElm$testLeafElement);
var _user$project$HtmlToElm_HtmlToElm$testLeafElement2 = _user$project$HtmlParser_HtmlParser$Element(
	{
		tagName: 'div',
		attributes: _user$project$HtmlToElm_HtmlToElm$testAttributes,
		children: {
			ctor: '::',
			_0: _user$project$HtmlParser_HtmlParser$Text('hello'),
			_1: {ctor: '[]'}
		}
	});
var _user$project$HtmlToElm_HtmlToElm$escapeDoubleQuotes = function (s) {
	return A4(
		_elm_lang$core$Regex$replace,
		_elm_lang$core$Regex$All,
		_elm_lang$core$Regex$regex('\"'),
		function (_p0) {
			return '\\\"';
		},
		s);
};
var _user$project$HtmlToElm_HtmlToElm$removeNewlines = function (s) {
	return A4(
		_elm_lang$core$Regex$replace,
		_elm_lang$core$Regex$All,
		_elm_lang$core$Regex$regex('\n'),
		function (_p1) {
			return '';
		},
		s);
};
var _user$project$HtmlToElm_HtmlToElm$flattenIndentTree = function (indentTree) {
	var flattenIndentTree_ = F2(
		function (indentTree, acc) {
			return A2(
				_elm_lang$core$Basics_ops['++'],
				_user$project$HtmlToElm_HtmlToElm$flattenIndentTree(indentTree),
				acc);
		});
	var _p2 = indentTree;
	if (_p2.ctor === 'IndentTreeLeaf') {
		return {
			ctor: '::',
			_0: _p2._0,
			_1: {ctor: '[]'}
		};
	} else {
		return A3(
			_elm_lang$core$List$foldr,
			flattenIndentTree_,
			{ctor: '[]'},
			_p2._0);
	}
};
var _user$project$HtmlToElm_HtmlToElm$renderTagFunctionHead = function (tagName) {
	return A2(_elm_lang$core$List$member, tagName, _user$project$HtmlToElm_ElmHtmlWhitelists$implementedTagFunctions) ? tagName : (A2(_elm_lang$core$List$member, tagName, _user$project$HtmlToElm_ElmHtmlWhitelists$reservedWords) ? A2(_elm_lang$core$Basics_ops['++'], tagName, '_') : A2(
		_elm_lang$core$Basics_ops['++'],
		'node \"',
		A2(_elm_lang$core$Basics_ops['++'], tagName, '\"')));
};
var _user$project$HtmlToElm_HtmlToElm$renderTextNode = function (node) {
	var _p3 = node;
	if (_p3.ctor === 'Text') {
		var text_ = _user$project$HtmlToElm_HtmlToElm$escapeDoubleQuotes(
			_user$project$HtmlToElm_HtmlToElm$removeNewlines(_p3._0));
		return A2(
			_elm_lang$core$Basics_ops['++'],
			'text \"',
			A2(_elm_lang$core$Basics_ops['++'], text_, '\"'));
	} else {
		return _elm_lang$core$Native_Utils.crashCase(
			'HtmlToElm.HtmlToElm',
			{
				start: {line: 80, column: 5},
				end: {line: 88, column: 28}
			},
			_p3)('');
	}
};
var _user$project$HtmlToElm_HtmlToElm$indent = F3(
	function (spacesPerIndent, indentLevel, s) {
		var spaces = spacesPerIndent * indentLevel;
		var listOfSpaces = A2(_elm_lang$core$List$repeat, spaces, ' ');
		return A2(
			_elm_lang$core$Basics_ops['++'],
			A2(_elm_lang$core$String$join, '', listOfSpaces),
			s);
	});
var _user$project$HtmlToElm_HtmlToElm$renderAttribute = function (_p5) {
	var _p6 = _p5;
	var _p8 = _p6._1;
	var _p7 = _p6._0;
	return A2(_elm_lang$core$List$member, _p7, _user$project$HtmlToElm_ElmHtmlWhitelists$implementedAttributeFunctions) ? A2(
		_elm_lang$core$Basics_ops['++'],
		_p7,
		A2(
			_elm_lang$core$Basics_ops['++'],
			' ',
			A2(
				_elm_lang$core$Basics_ops['++'],
				'\"',
				A2(_elm_lang$core$Basics_ops['++'], _p8, '\"')))) : (A2(_elm_lang$core$List$member, _p7, _user$project$HtmlToElm_ElmHtmlWhitelists$reservedWords) ? A2(
		_elm_lang$core$Basics_ops['++'],
		_p7,
		A2(
			_elm_lang$core$Basics_ops['++'],
			'_ ',
			A2(
				_elm_lang$core$Basics_ops['++'],
				'\"',
				A2(_elm_lang$core$Basics_ops['++'], _p8, '\"')))) : A2(
		_elm_lang$core$Basics_ops['++'],
		'attribute \"',
		A2(
			_elm_lang$core$Basics_ops['++'],
			_p7,
			A2(
				_elm_lang$core$Basics_ops['++'],
				'\"',
				A2(
					_elm_lang$core$Basics_ops['++'],
					' \"',
					A2(_elm_lang$core$Basics_ops['++'], _p8, '\"'))))));
};
var _user$project$HtmlToElm_HtmlToElm$renderAttributes = function (attributes) {
	var attributesList = _elm_lang$core$Dict$toList(attributes);
	var attributeListString = A2(_elm_lang$core$List$map, _user$project$HtmlToElm_HtmlToElm$renderAttribute, attributesList);
	var innards = A2(_elm_lang$core$String$join, ', ', attributeListString);
	var _p9 = innards;
	if (_p9 === '') {
		return '[]';
	} else {
		return A2(
			_elm_lang$core$Basics_ops['++'],
			'[ ',
			A2(_elm_lang$core$Basics_ops['++'], innards, ' ]'));
	}
};
var _user$project$HtmlToElm_HtmlToElm$IndentTrees = function (a) {
	return {ctor: 'IndentTrees', _0: a};
};
var _user$project$HtmlToElm_HtmlToElm$IndentTreeLeaf = function (a) {
	return {ctor: 'IndentTreeLeaf', _0: a};
};
var _user$project$HtmlToElm_HtmlToElm$indentTreeStrings = F2(
	function (spacesPerIndent, originalTree) {
		var indentTreeStrings_ = F2(
			function (depth, currTree) {
				var indentLevel = (depth / 2) | 0;
				var _p10 = currTree;
				if (_p10.ctor === 'IndentTreeLeaf') {
					return _user$project$HtmlToElm_HtmlToElm$IndentTreeLeaf(
						A3(_user$project$HtmlToElm_HtmlToElm$indent, spacesPerIndent, indentLevel, _p10._0));
				} else {
					return _user$project$HtmlToElm_HtmlToElm$IndentTrees(
						A2(
							_elm_lang$core$List$map,
							indentTreeStrings_(depth + 1),
							_p10._0));
				}
			});
		return A2(indentTreeStrings_, 0, originalTree);
	});
var _user$project$HtmlToElm_HtmlToElm$formatHaskellMultilineList = function (indentTrees) {
	var transformTailLine = function (indentTree_) {
		var _p11 = indentTree_;
		if (_p11.ctor === 'IndentTreeLeaf') {
			return _user$project$HtmlToElm_HtmlToElm$IndentTreeLeaf(
				A2(_elm_lang$core$Basics_ops['++'], ', ', _p11._0));
		} else {
			if (_p11._0.ctor === '::') {
				return _user$project$HtmlToElm_HtmlToElm$IndentTrees(
					A2(
						_elm_lang$core$Basics_ops['++'],
						{
							ctor: '::',
							_0: transformTailLine(_p11._0._0),
							_1: {ctor: '[]'}
						},
						_p11._0._1));
			} else {
				return _elm_lang$core$Native_Utils.crashCase(
					'HtmlToElm.HtmlToElm',
					{
						start: {line: 199, column: 13},
						end: {line: 205, column: 36}
					},
					_p11)('');
			}
		}
	};
	var transformHeadLine = function (indentTree_) {
		var _p13 = indentTree_;
		if (_p13.ctor === 'IndentTreeLeaf') {
			return _user$project$HtmlToElm_HtmlToElm$IndentTreeLeaf(
				A2(_elm_lang$core$Basics_ops['++'], '[ ', _p13._0));
		} else {
			if (_p13._0.ctor === '::') {
				return _user$project$HtmlToElm_HtmlToElm$IndentTrees(
					A2(
						_elm_lang$core$Basics_ops['++'],
						{
							ctor: '::',
							_0: transformHeadLine(_p13._0._0),
							_1: {ctor: '[]'}
						},
						_p13._0._1));
			} else {
				return _elm_lang$core$Native_Utils.crashCase(
					'HtmlToElm.HtmlToElm',
					{
						start: {line: 189, column: 13},
						end: {line: 195, column: 36}
					},
					_p13)('');
			}
		}
	};
	var _p15 = indentTrees;
	if (_p15.ctor === '::') {
		if (_p15._1.ctor === '[]') {
			var _p17 = _p15._0;
			var _p16 = _p17;
			if (_p16.ctor === 'IndentTreeLeaf') {
				return {
					ctor: '::',
					_0: _user$project$HtmlToElm_HtmlToElm$IndentTreeLeaf(
						A2(
							_elm_lang$core$Basics_ops['++'],
							'[ ',
							A2(_elm_lang$core$Basics_ops['++'], _p16._0, ' ]'))),
					_1: {ctor: '[]'}
				};
			} else {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					{
						ctor: '::',
						_0: transformHeadLine(_p17),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: _user$project$HtmlToElm_HtmlToElm$IndentTreeLeaf(']'),
						_1: {ctor: '[]'}
					});
			}
		} else {
			return A2(
				_elm_lang$core$Basics_ops['++'],
				{
					ctor: '::',
					_0: transformHeadLine(_p15._0),
					_1: {ctor: '[]'}
				},
				A2(
					_elm_lang$core$Basics_ops['++'],
					A2(_elm_lang$core$List$map, transformTailLine, _p15._1),
					{
						ctor: '::',
						_0: _user$project$HtmlToElm_HtmlToElm$IndentTreeLeaf(']'),
						_1: {ctor: '[]'}
					}));
		}
	} else {
		return indentTrees;
	}
};
var _user$project$HtmlToElm_HtmlToElm$renderVerticalChild = function (node) {
	var _p18 = node;
	if (_p18.ctor === 'Element') {
		var _p20 = _p18._0.children;
		var childrenLines = function () {
			var _p19 = _p20;
			if (_p19.ctor === '[]') {
				return {
					ctor: '::',
					_0: _user$project$HtmlToElm_HtmlToElm$IndentTreeLeaf('[]'),
					_1: {ctor: '[]'}
				};
			} else {
				return _user$project$HtmlToElm_HtmlToElm$formatHaskellMultilineList(
					A2(_elm_lang$core$List$map, _user$project$HtmlToElm_HtmlToElm$renderNode, _p20));
			}
		}();
		var firstLine = A2(
			_elm_lang$core$Basics_ops['++'],
			_user$project$HtmlToElm_HtmlToElm$renderTagFunctionHead(_p18._0.tagName),
			A2(
				_elm_lang$core$Basics_ops['++'],
				' ',
				_user$project$HtmlToElm_HtmlToElm$renderAttributes(_p18._0.attributes)));
		return _user$project$HtmlToElm_HtmlToElm$IndentTrees(
			{
				ctor: '::',
				_0: _user$project$HtmlToElm_HtmlToElm$IndentTreeLeaf(firstLine),
				_1: {
					ctor: '::',
					_0: _user$project$HtmlToElm_HtmlToElm$IndentTrees(childrenLines),
					_1: {ctor: '[]'}
				}
			});
	} else {
		return _user$project$HtmlToElm_HtmlToElm$IndentTreeLeaf(
			_user$project$HtmlToElm_HtmlToElm$renderTextNode(node));
	}
};
var _user$project$HtmlToElm_HtmlToElm$renderNode = function (node) {
	return _user$project$HtmlToElm_HtmlToElm$renderVerticalChild(node);
};
var _user$project$HtmlToElm_HtmlToElm$verticallyRenderChildren = function (nodes) {
	return _user$project$HtmlToElm_HtmlToElm$IndentTrees(
		A2(_elm_lang$core$List$map, _user$project$HtmlToElm_HtmlToElm$renderVerticalChild, nodes));
};
var _user$project$HtmlToElm_HtmlToElm$htmlNodeToElm = F2(
	function (spacesPerIndent, node) {
		return A2(
			_elm_lang$core$String$join,
			'\n',
			_user$project$HtmlToElm_HtmlToElm$flattenIndentTree(
				A2(
					_user$project$HtmlToElm_HtmlToElm$indentTreeStrings,
					spacesPerIndent,
					_user$project$HtmlToElm_HtmlToElm$renderNode(node))));
	});
var _user$project$HtmlToElm_HtmlToElm$htmlToElm = F2(
	function (spacesPerIndent, s) {
		if (_elm_lang$core$Native_Utils.eq(s, '')) {
			return _elm_lang$core$Maybe$Just('');
		} else {
			var _p21 = _user$project$HtmlParser_HtmlParser$parseHtml(s);
			if (_p21.ctor === 'Just') {
				return _elm_lang$core$Maybe$Just(
					A2(_user$project$HtmlToElm_HtmlToElm$htmlNodeToElm, spacesPerIndent, _p21._0));
			} else {
				return _elm_lang$core$Maybe$Nothing;
			}
		}
	});
var _user$project$HtmlToElm_HtmlToElm$testIndentTree = _user$project$HtmlToElm_HtmlToElm$IndentTrees(
	{
		ctor: '::',
		_0: _user$project$HtmlToElm_HtmlToElm$IndentTreeLeaf('a'),
		_1: {
			ctor: '::',
			_0: _user$project$HtmlToElm_HtmlToElm$IndentTrees(
				{
					ctor: '::',
					_0: _user$project$HtmlToElm_HtmlToElm$IndentTreeLeaf('b'),
					_1: {ctor: '[]'}
				}),
			_1: {ctor: '[]'}
		}
	});
var _user$project$HtmlToElm_HtmlToElm$tests = A2(
	_rtfeldman$legacy_elm_test$Legacy_ElmTest$suite,
	'HtmlToElm.elm',
	{
		ctor: '::',
		_0: A2(
			_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
			'renderAttribute',
			A2(
				_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
				'class \"success\"',
				_user$project$HtmlToElm_HtmlToElm$renderAttribute(
					{ctor: '_Tuple2', _0: 'class', _1: 'success'}))),
		_1: {
			ctor: '::',
			_0: A2(
				_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
				'renderAttributes',
				A2(
					_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
					'[ class \"success\", id \"1\" ]',
					_user$project$HtmlToElm_HtmlToElm$renderAttributes(
						_elm_lang$core$Dict$fromList(
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'id', _1: '1'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'class', _1: 'success'},
									_1: {ctor: '[]'}
								}
							})))),
			_1: {
				ctor: '::',
				_0: A2(
					_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
					'renderAttributes',
					A2(
						_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
						'[]',
						_user$project$HtmlToElm_HtmlToElm$renderAttributes(
							_elm_lang$core$Dict$fromList(
								{ctor: '[]'})))),
				_1: {
					ctor: '::',
					_0: A2(
						_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
						'renderTextNode',
						A2(
							_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
							'text \"hello\"',
							_user$project$HtmlToElm_HtmlToElm$renderTextNode(
								_user$project$HtmlParser_HtmlParser$Text('hello')))),
					_1: {
						ctor: '::',
						_0: A2(
							_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
							'indent',
							A2(
								_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
								'        hello',
								A3(_user$project$HtmlToElm_HtmlToElm$indent, 4, 2, 'hello'))),
						_1: {
							ctor: '::',
							_0: A2(
								_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
								'indentTree',
								A2(
									_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
									_user$project$HtmlToElm_HtmlToElm$IndentTrees(
										{
											ctor: '::',
											_0: _user$project$HtmlToElm_HtmlToElm$IndentTreeLeaf('a'),
											_1: {
												ctor: '::',
												_0: _user$project$HtmlToElm_HtmlToElm$IndentTreeLeaf('b'),
												_1: {ctor: '[]'}
											}
										}),
									_user$project$HtmlToElm_HtmlToElm$IndentTrees(
										{
											ctor: '::',
											_0: _user$project$HtmlToElm_HtmlToElm$IndentTreeLeaf('a'),
											_1: {
												ctor: '::',
												_0: _user$project$HtmlToElm_HtmlToElm$IndentTreeLeaf('b'),
												_1: {ctor: '[]'}
											}
										}))),
							_1: {
								ctor: '::',
								_0: A2(
									_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
									'flattenIndentTree',
									A2(
										_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
										{
											ctor: '::',
											_0: 'a',
											_1: {
												ctor: '::',
												_0: 'b',
												_1: {ctor: '[]'}
											}
										},
										_user$project$HtmlToElm_HtmlToElm$flattenIndentTree(_user$project$HtmlToElm_HtmlToElm$testIndentTree))),
								_1: {
									ctor: '::',
									_0: A2(
										_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
										'formatHaskellMultilineList',
										A2(
											_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
											{
												ctor: '::',
												_0: _user$project$HtmlToElm_HtmlToElm$IndentTreeLeaf('[ X'),
												_1: {
													ctor: '::',
													_0: _user$project$HtmlToElm_HtmlToElm$IndentTreeLeaf(', X'),
													_1: {
														ctor: '::',
														_0: _user$project$HtmlToElm_HtmlToElm$IndentTreeLeaf(']'),
														_1: {ctor: '[]'}
													}
												}
											},
											_user$project$HtmlToElm_HtmlToElm$formatHaskellMultilineList(
												{
													ctor: '::',
													_0: _user$project$HtmlToElm_HtmlToElm$IndentTreeLeaf('X'),
													_1: {
														ctor: '::',
														_0: _user$project$HtmlToElm_HtmlToElm$IndentTreeLeaf('X'),
														_1: {ctor: '[]'}
													}
												}))),
									_1: {
										ctor: '::',
										_0: A2(
											_rtfeldman$legacy_elm_test$Legacy_ElmTest$test,
											'just text',
											A2(
												_rtfeldman$legacy_elm_test$Legacy_ElmTest$assertEqual,
												_user$project$HtmlToElm_HtmlToElm$IndentTreeLeaf('x'),
												function () {
													var _p22 = _user$project$HtmlParser_HtmlParser$parseHtml('hello');
													if (_p22.ctor === 'Just') {
														return _user$project$HtmlToElm_HtmlToElm$renderNode(_p22._0);
													} else {
														return _user$project$HtmlToElm_HtmlToElm$IndentTreeLeaf('x');
													}
												}())),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}
			}
		}
	});
var _user$project$HtmlToElm_HtmlToElm$main = _rtfeldman$legacy_elm_test$Legacy_ElmTest$runSuiteHtml(_user$project$HtmlToElm_HtmlToElm$tests)();

var _user$project$Main$delayMsg = F2(
	function (time, msg) {
		return A2(
			_elm_lang$core$Task$perform,
			function (_p0) {
				return msg;
			},
			_elm_lang$core$Process$sleep(time));
	});
var _user$project$Main$exitApp = _elm_lang$core$Native_Platform.outgoingPort(
	'exitApp',
	function (v) {
		return v;
	});
var _user$project$Main$externalStop = _elm_lang$core$Native_Platform.incomingPort(
	'externalStop',
	_elm_lang$core$Json_Decode$null(
		{ctor: '_Tuple0'}));
var _user$project$Main$incomingHtmlCode = _elm_lang$core$Native_Platform.incomingPort('incomingHtmlCode', _elm_lang$core$Json_Decode$string);
var _user$project$Main$outgoingElmCode = _elm_lang$core$Native_Platform.outgoingPort(
	'outgoingElmCode',
	function (v) {
		return (v.ctor === 'Nothing') ? null : v._0;
	});
var _user$project$Main$update = F2(
	function (msg, model) {
		var _p1 = msg;
		switch (_p1.ctor) {
			case 'Stop':
				return A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					model,
					{
						ctor: '::',
						_0: _user$project$Main$exitApp(0),
						_1: {ctor: '[]'}
					});
			case 'Abort':
				return A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					model,
					{
						ctor: '::',
						_0: _user$project$Main$exitApp(-1),
						_1: {ctor: '[]'}
					});
			default:
				var _p2 = _p1._0;
				var elmCode = A2(_user$project$HtmlToElm_HtmlToElm$htmlToElm, model.indentSpaces, _p2);
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{html: _p2, elmCode: elmCode}),
					_1: _elm_lang$core$Platform_Cmd$batch(
						{
							ctor: '::',
							_0: _user$project$Main$outgoingElmCode(elmCode),
							_1: {ctor: '[]'}
						})
				};
		}
	});
var _user$project$Main$Model = F4(
	function (a, b, c, d) {
		return {html: a, elmCode: b, indentSpaces: c, currentSnippet: d};
	});
var _user$project$Main$HtmlInput = function (a) {
	return {ctor: 'HtmlInput', _0: a};
};
var _user$project$Main$Abort = {ctor: 'Abort'};
var _user$project$Main$subscriptions = function (model) {
	return _elm_lang$core$Platform_Sub$batch(
		{
			ctor: '::',
			_0: _user$project$Main$externalStop(
				_elm_lang$core$Basics$always(_user$project$Main$Abort)),
			_1: {
				ctor: '::',
				_0: _user$project$Main$incomingHtmlCode(_user$project$Main$HtmlInput),
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$Main$Stop = {ctor: 'Stop'};
var _user$project$Main$init = {
	ctor: '_Tuple2',
	_0: {
		html: '',
		elmCode: _elm_lang$core$Maybe$Just(''),
		indentSpaces: 4,
		currentSnippet: ''
	},
	_1: A2(_user$project$Main$delayMsg, 3000, _user$project$Main$Stop)
};
var _user$project$Main$main = _elm_lang$core$Platform$program(
	{init: _user$project$Main$init, update: _user$project$Main$update, subscriptions: _user$project$Main$subscriptions})();

var Elm = {};
Elm['Main'] = Elm['Main'] || {};
if (typeof _user$project$Main$main !== 'undefined') {
    _user$project$Main$main(Elm['Main'], 'Main', undefined);
}

if (typeof define === "function" && define['amd'])
{
  define([], function() { return Elm; });
  return;
}

if (typeof module === "object")
{
  module['exports'] = Elm;
  return;
}

var globalElm = this['Elm'];
if (typeof globalElm === "undefined")
{
  this['Elm'] = Elm;
  return;
}

for (var publicModule in Elm)
{
  if (publicModule in globalElm)
  {
    throw new Error('There are two Elm modules called `' + publicModule + '` on this page! Rename one of them.');
  }
  globalElm[publicModule] = Elm[publicModule];
}

}).call(this);

