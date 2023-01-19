// Order sensitive
// First match in list is take
function getItems()/*: IItem[]*/ {
    return [
        image,
        section,
        list,
        div,
        vanila
    ];
}

function resetAll()/*: void*/ {
    resetList();
    resetSection();
}
