// MODULES //
// making use of IIFE - Immediately Invoked Function Expression
// BUDGET CONTROLLER
var budgetController = (function () {

    var Expense = function (id, description, value) { // making Expense object
        // Expense object has 3 properties: id, description, value
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function (id, description, value) { // making Income object
        // Income object has 3 properties: id, description, value
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        //sort array according to inc or exp
        data.allItems[type].forEach(function (current) {
            sum = sum + current.value;
        });
        data.totals[type] = sum;
    };


    //global data model:
    var data = { // data = object
        allItems: { // is allItems just an object inside another object? YES
            // allItems is an object containing 2 more objects (2 arrays)
            exp: [], // exp (expense) = array = object - so just listing all expenses
            // exp here is related to type in addItem function below
            inc: [] // inc (income) = array =  object - so just listing all incomes
            // inc here is related to type in addItem function below
        },
        totals: { // is totals just an object inside another object?  YES
            exp: 0, // store total expense
            inc: 0 // store total income
        },

        budget: 0,
        percentage: -1

    };

    return {
        addItem: function (type, des, val) { // type is either 'exp' or 'inc' (expense / income)
            // type here relates to income/expense - which is used by allItems above (which stores exp and inc)
            //addItem is a function w/ 3 arguments 
            //when this is called by budgetCtrl.addItem - passes 3 arguments:
            //input.type
            //input.description
            //input.value
            //these 3 arguments are obtained through DOM manipulation via the getInput function located in UIController

            var newItem;
            var ID;

            // for the ID:
            // [1 2 3 4 5] next ID = 6
            // [1 2 4 6 8] next ID = 9
            // ID = last ID + 1


            // create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }


            // create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            // push the new item into our data structure
            data.allItems[type].push(newItem);

            // return the new element
            return newItem;
        },

        calculateBudget: function () {

            // calculate total income & expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we have spent - only calculate if income is > 0
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };

        },

        testing: function () {
            console.log(data);
        }

    };


})();


// UI CONTROLLER
var UIController = (function () {

    var DOMStrings = { // create object to store all querySelector html classes
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        // add containers for where we will insert html into the DOM:
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list'
    };


    return {
        getInput: function () {

            return {

                type: document.querySelector(DOMStrings.inputType).value,
                //will be either inc or exp 
                description: document.querySelector(DOMStrings.inputDescription).value,
                //convert string into number for calculations
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
                // so type, description, and value are all objects?
                // or are they just properties?

            };

        },

        addListItem(obj, type) {
            var html;
            var newHtml;
            var element;

            // create html string with placeholder text

            if (type === 'inc') {
                element = DOMStrings.incomeContainer;

                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;

                html = '<div class="item clearfix" id="expense%id%"><div class="item__description">%description%</div><div class="right clearfix"><divclass="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);
            // how does obj get the .id .description .value?

            // insert the html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        // after user enters description & value and has pressed enter or the 'tick' button, want to clear those two fields:
        clearFields: function () {
            var fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            // no idea what is going on here
            // turning fields into an array using the .slice() property
            // calls the .slice property by using the prototype propery of the Array object?

            var fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function (current, index, array) {
                current.value = "";
            });
            // after clearing, set cursor/focus back in the description box 
            fieldsArray[0].focus();

        },


        getDOMStrings: function () {
            return DOMStrings; // make object's items public? 
        }

    };

})();


// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var setupEventListeners = function () {

        var DOM = UICtrl.getDOMStrings(); // get object DOMStrings to access the html classes 
        // getDOMStrings() simply returns something, so need to assign a variable to it?
        // getDOMStrings returns inputType, inputDescription, inputValue via DOM manipulation

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        // the arrow tick button to add an item 

        document.addEventListener('keypress', function (event) {

            // confirm that <ENTER> key was pressed:

            if (event.keyCode === 13 || event.which === 13) {
                // console.log('enter key pressed');

                ctrlAddItem();
            }

        });

    };
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////

    var updateBudget = function () {

        //1 Calculate the budget
        budgetCtrl.calculateBudget();

        //2 Return the budget
        var budget = budgetCtrl.getBudget();

        //3 Display the budget in the UI
        console.log(budget);
    };



    var ctrlAddItem = function () {
        var input, newItem;


        // 1. get the field input data
        input = UICtrl.getInput(); // get input values user enters into the html classes
        //getInput() simply returns some values, so needs to be assigned to a variable (var = input)

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            //addItem function found in budgetController
            //addItem returns an object (newItem)
            //so since the addItem function simply returns something in budgetController, need to assign it to a value 


            // 3. add the item to the UI 
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();
            // 5. calculate and update the budget
            updateBudget();

        }


    };

    return {
        init: function () {
            console.log('application has started');
            setupEventListeners();
        }
    };



})(budgetController, UIController);

controller.init(); // initialize the program
