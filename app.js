// MODULES //
// making use of IIFE - Immediately Invoked Function Expression
// BUDGET CONTROLLER
var budgetController = (function () {

    var Expense = function (id, description, value) { // making Expense object
        // Expense object has 3 properties: id, description, value
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100); 
        } else {
            this.percentage = -1;
        }

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
        

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

        deleteItem: function (type, id) {

            // the map() method creates a new array with the results of calling a 
            // provided function on every element in the calling array
            // Example:
            // var numbers = [1, 2, 3, 4, 5];
            // var doubles = numbers.map(function(x) {
            // return x * 2
            // });
            // doubles now equals [2, 4, 6, 8, 10]
            // numbers STILL EQUALS [1, 2, 3, 4, 5]
            var ids = data.allItems[type].map(function(current) { 
                return current.id;
            });
            
            var index = ids.indexOf(id);

            /* splice() method changes contents of array by removing existing elements
            and/or adding new elements
            var myFish = ['angel', 'clown', 'mandarin', 'sturgeon'];
            myFish.splce(2, 0, 'drum'); // insert 'drum' @ 2-index position 
            myFish becomes: ['angel', 'clown', 'drum', 'mandarin', 'sturgeon'];
            
            myFish.splce(2, 1) // remove 1 item @ 2-index position
            myFish becomes: ['angel', 'clown', 'mandarin', 'sturgeon'];
            
            SYNTAX:
            array.splce(start, deleteCount, item1, item2, ...);
            deleteCount and items are optional

            If deleteCount = 0, no items are removed
            In this case, should specific at least one new item to add
            to the array
            */

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

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

        calculatePercentages : function() {

            data.allItems.exp.forEach(function(current) {
                current.calcPercentage(data.totals.inc);
            });

        },
        
        getPercentages: function() {
            var allPercentages = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });
            return allPercentages;
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
        expensesContainer: '.expenses__list',
        //DOM manipulation to display totals (budget, income, expense):
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
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

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;

                html = '<div class="item clearfix" id="exp%id%"><div class="item__description">%description%</div><div class="right clearfix"><divclass="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);
            // how does obj get the .id .description .value?

            // insert the html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
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

        displayBudget: function (obj) {

            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMStrings.expenseLabel).textContent = obj.totalExp;

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }

        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMStrings.expensesPercentageLabel);

            // making use of a callback function:
            var nodeListForEach = function(list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };

            nodeListForEach(fields, function(current, index) {
                // when we call nodeListForEach - pass 2 arguments, one being a function :
                // an (anonymous function)
                // 'callback' gets passed the anonymous function 
                // when callback is called, it is passed two arguments, 'current' and 'index',
                // as specified in the anonymous function 
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';       
                } else {
                    current.textContent = '---';
                }
                

            });

            
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

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    };
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////

    var updateBudget = function () {

        //1 Calculate the budget
        budgetCtrl.calculateBudget();

        //2 Return the budget
        var budget = budgetCtrl.getBudget();

        //3 Display the budget in the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {
        
        // 1. calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. read percentages from the UI
        var percentages = budgetCtrl.getPercentages();
        
        // 3. update UI with new percentages 
        UICtrl.displayPercentages(percentages); 
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

            // 6. calculate and update percentages 
            updatePercentages();

        }


    };

    var ctrlDeleteItem = function (event) {

        var itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            //inc-1
            var splitID = itemID.split('-');
            var type = splitID[0];
            var ID = parseInt(splitID[1]);

            // 1. delete the item from the data structrure
            budgetCtrl.deleteItem(type, ID);

            // 2. delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. update and show the new budget
            updateBudget();

            // 4. calculate and update percentages 
            updatePercentages();
        }
    };

    return {
        init: function () {
            console.log('application has started');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1,
            });
            setupEventListeners();
        }
    };



})(budgetController, UIController);

controller.init(); // initialize the program