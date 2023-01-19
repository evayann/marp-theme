// Order sensitive
// First match in list is take
function getItems()/*: IItem[]*/ {
    return [
        // Unit Item
        image,
        list,

        // Container
        div,
        section,

        // Default
        vanila
    ];
}

function resetAll()/*: void*/ {
    resetList();
    resetSection();
}
