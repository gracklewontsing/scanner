//implement file reading library
const fs = require("fs")

//declare file to be read and convert it to string
let file = fs.readFileSync("./example.cmm").toString() + " "

//initialize token and symbol lists, as well as indexes for symbol lists
var token_list = [];
var identifier_list = [];
var number_list = [];
var id_index = 0;
var num_index = 0;

//declare token state id's
var token_dict = new Map();
  token_dict.set(8,"identifier")
  token_dict.set(9,"number")
  token_dict.set(10,"comment")
  token_dict.set(11,"symbol")
  token_dict.set(12,"specialsym")  
  
//declare transition table
var transition_table = [
  //w d  +  -  *  /  (  )  [  ]  {  }  ,  ;  <  >  !  = del any
  [1 ,2 ,11,11,11,3 ,11,11,11,11,11,11,11,11,6 ,6 ,7 ,6 ,0 ,13], //state 0
  [1 ,8 ,8 ,8 ,8 ,8 ,8 ,8 ,8 ,8 ,8 ,8 ,8 ,8 ,8 ,8 ,13,8 ,8 ,13], //state 1
  [9 ,2 ,9 ,9 ,9 ,9 ,9 ,9 ,9 ,9 ,9 ,9 ,9 ,9 ,9 ,9 ,13,9 ,9 ,13], //state 2
  [11,11,11,11,4 ,11,11,11,11,11,11,11,11,11,11,11,13,11,11,13], //state 3
  [4 ,4 ,4 ,4 ,5 ,4 ,4 ,4 ,4 ,4 ,4 ,4 ,4 ,4 ,4 ,4 ,4 ,4 ,4 ,4 ], //state 4
  [4 ,4 ,4 ,4 ,5 ,10, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,4 ], //state 5
  [11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,13,12,11,13], //state 6
  [13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,12,13,13], //state 7
  //further states represent acceptance and error
];

//declare state variables
let state_acceptance = [8,9,10,11,12]
let state_invalid = 13

//declare character codes
let char_uppercase_letter = [65,90]
let char_lowercase_letter = [97,122]
let char_digits = [48,57]
let char_plus = 43
let char_minus = 45
let char_multiplier = 42
let char_slash = 47
let char_left_parenthesis = 40
let char_right_parenthesis = 41
let char_left_square_bracket = 91
let char_right_square_bracket = 93
let char_left_curly_bracket = 123
let char_right_curly_bracket = 125
let char_comma = 44
let char_semicolon = 59
let char_less_than = 60
let char_greater_than = 62
let char_exclamation = 33 
let char_equal = 61
let char_del = [9,10,13,32]

//declare corresponding character column numbers
let map_letter = 0
let map_digit = 1
let map_plus = 2
let map_minus = 3
let map_multiplier = 4
let map_slash = 5
let map_left_parenthesis = 6
let map_right_parenthesis = 7
let map_left_square_bracket = 8
let map_right_square_bracket = 9
let map_left_curly_bracket = 10
let map_right_curly_bracket = 11
let map_comma = 12
let map_semicolon = 13
let map_less_than = 14
let map_greater_than = 15
let map_exclamation = 16
let map_equal = 17
let map_del = 18
let map_any = 19

//declare keywords
let keywords = ["else","if", "int", "return", "void", "while", "input", "output"]

//function to detect if identifier is keyword, as per improvements found in slide 65 of chapter 2
function isKeyword(lexeme){
  return keywords.includes(lexeme)
}

//function to get active state column
function setColumn(char) {
  let col;
  let char_id = char.charCodeAt()  
  
  //switch case to determine corresponding column and row position based on character
  //returns column number
  switch (true) {

    //character is a letter
    case ((char_id >= char_uppercase_letter[0] && char_id <= char_uppercase_letter[1])  ||
         (char_id >= char_lowercase_letter[0] && char_id <= char_lowercase_letter[1])):
      col = map_letter
      return col
    //character is a number
    case (char_id >= char_digits[0] && char_id <= char_digits[1]) :
      col = map_digit
      return col

    //character is +
    case (char_id == char_plus):
      col = map_plus
      return col

    //character is -
    case (char_id == char_minus):
      col = map_minus
      return col

    //character is *
    case (char_id == char_multiplier):
      col = map_multiplier
      return col

    //character is /
    case (char_id == char_slash):
      col = map_slash
      return col

    //character is (
    case (char_id == char_left_parenthesis):
      col = map_left_parenthesis
      return col

    //character is )
    case(char_id == char_right_parenthesis):
      col = map_right_parenthesis
      return col

    //character is [
    case(char_id == char_left_square_bracket):
      col = map_left_square_bracket
      return col

    //character is ]
    case(char_id == char_right_square_bracket):
      col = map_right_square_bracket
      return col

    //character is {
    case(char_id == char_left_curly_bracket):
      col = map_left_curly_bracket
      return col

    //character is }
    case(char_id == char_right_curly_bracket):
      col = map_right_curly_bracket
      return col

    //character is ,
    case(char_id == char_comma):
      col = map_comma
      return col

    //character is ;
    case(char_id == char_semicolon):
      col = map_semicolon
      return col

    //character is <
    case(char_id == char_less_than):
      col = map_less_than
      return col

    //character is >
    case(char_id == char_greater_than):
      col = map_greater_than
      return col

    //character is !
    case(char_id == char_exclamation):
      col = map_exclamation
      return col

    //character is =
    case(char_id == char_equal):
      col = map_equal
      return col
    
    //character is any given delimiter character, i.e: whitespace, \n...
    case(char_del.includes(char_id) || char === "\n"):
      col = map_del
      return col
    
    //character is any character not included in the language
    default:
      col = map_any  
      return col  
  }
}

//function to add token to a list when matched
function addToken(lexeme, state){

  //initialize generic arrays to insert lexeme info
  var token = new Object();   
  var identifier = new Object();
  var number = new Object();
  type = token_dict.get(state) 
  
  //if lexeme is not keyword, proceed
  if (!isKeyword(lexeme)) {
  //if valid token matches identifier rules, add to symbol table with index number
    if(state === 8){
      identifier["Entry #"] = id_index++
      identifier["Value"] = lexeme
      identifier_list.push(identifier)      
    }

    //if valid token matches number rules, add to symbol table with index number
    else if (state === 9){
      number["Entry #"] = num_index++
      number["Value"] = lexeme      
      number_list.push(number)
    }
    //mark token types as detected
    token["Type"] = type    
  }

  //else, mark as keyword and export to token list
  else {
    token["Type"] = "Keyword"     
  }

  //push token to token list with defined parameters   
  token["Value"] = lexeme   
  token_list.push(token)    
}

//function to scan file and retrieve information
function scan() {

  //set iterators and init token variables and state variables
  let state = 0
  let char = ""
  let lexeme = ""
  let i = 0  

  //cycle through chars in file
  while (i < file.length) {                             
    char = file[i]     

    //given state is state 0
    if(state === 0){

      //skip token parsing and accounting of lonely delimiters
      if(setColumn(char) === 18){      
        i++
        continue
      }    

      //if in base state and next state is accepting, add current char to lexeme and advance   
      else if(state_acceptance.includes(transition_table[state][setColumn(char)])){
        lexeme += char
        i++
      }
    }     

    //if state is invalid, throw error and abort
    else if(state === state_invalid) {      
      console.log("Error: Unexpected character found in lexeme: '" + lexeme + "' at position: "+i+". Please review code.")
      return 0    
    }  

    //set state to corresponding cell in transition table given a character's column number
    state = transition_table[state][setColumn(char)]                           

    //upon reaching an acceptance state, prepare to add token to list and corresponding symbol tables
    if(state_acceptance.includes(state)) {           
      //for states that end the lexeme upon finding accepting characters, 
      //add the current char and advance to avoid parsing it as a single symbol
      if(state === 10 || state === 12){
        lexeme += char
        i++
      }

      //if the lexeme is not empty, validate and tokenize the lexeme, and add to corresponding symbol tables
      if(lexeme.length>0){   
        addToken(lexeme, state) 
        state = 0
        lexeme = ""                                     
      }             
      continue
    }                 

    //while the state remains active, add current char to lexeme string and advance loop                                              
    lexeme += char          
    i++              
  }    

  //avoid continuous scanning while a comment state or any state remains open/active, abort
  if(i===file.length && state === 4) {
    console.log("ERROR: Token unable to terminate scanning. Please check for comments or errors within the file. Possible empty file or unterminated comment.")
    return 0
  } 
  
  //print logs regarding token, id and number tables, and also output to a file with fs
  console.log(token_list)
  fs.writeFileSync("./table_id.json", JSON.stringify(identifier_list))
  fs.writeFileSync("./table_num.json", JSON.stringify(number_list))
  fs.writeFileSync("./table_token.json", JSON.stringify(token_list))
}

//export scanning function to main.js or any other
exports.scan = scan;

