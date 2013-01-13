rfidash
=======

## Timeline:
- 1/13 Create express app that mimics all the commands to interface the redis client.
- 1/16 turn these into background tasks, which are run every minute
- 1/16 make socket.io work with this
- 1/17 setup backbone
- 1/18 make socket.io work with backbone
- 1/19 fix animations, etc...
- 1/20 should be mostly done by now, just perfect stuff on the frontend


## Sample JSON:


```
Item Object - 
{
	itemID: <number>,
	quantity: <number>,
	sectionID: <number>,
	name: <string>,
	modifier: [list(<modifier id>)],
}
```

# Server:

### Inventory Simulator

We want to generate fake data. Only the quantity will change at this point. At this point the server just changes the quantity at random times. It will usually just decrease quantity.

The simulator will have a series of preset defaults. We will assume:
- random stock (60%) will get depleted at a gradual constant level (random from 5-10 minutes) by a random number (1-10)
- stock will get replenished periodically (for those that are depleted)

## Methods of simulator.js
```
sections = [men, women, girls, boys, kids, babies] // (for now)
init() // generates a list of 100 random items in the redis client
getItems() 	// returns a list of items (see object above)
addItem() // - adds a new item to the list (randomly generated for now)
deleteItem(itemId) // deletes the item with the item id
addInventory(itemid, num) // add inventory to item by #num
decreaseInventory(itemid, num) // decrement inventory to item by #num
```

## Data structures in redis

```
Keys:
	- itemid:[itemid]
	- sectionid:[sectiontype]
	- modifierid:[modifiertype]

Hashes:
	- HMSET itemid:[itemid] sectionid [sectionid] name [name string here] type [modifier type here]

Sorted set: (this is the main thing that we care about, at least for v1)
	- [itemid key here] [quantity]

```







## PUB SUB
 for now will contain all items, ideally later it will have it sorted by different categories or different notification levels.