//implement file reading library
const fs = require("fs")

//declare file to be read
let file = fs.readFileSync("./example.cmm")
//declare expressions to parse file with
//let regex_id = /[a-zA-Z]+/g
//let regex_num = /[0-9]+/g
//let regex_sym = /([\>\<\!\=]{1}\=|\/\*|\*\/|[\/\*\-\+\;\,\{\}\[\]\(\)])/g
let regex_splitter = /(\s|[a-zA-Z]+|[0-9]+|[\>\<\!\=]{1}\=|\/\*|\*\/|\W)/g

//declare token id's
var token_dict = new Map();
  token_dict.set("identifier",1)
  token_dict.set("number",2)
  token_dict.set("/*",3)
  token_dict.set("*/",4)
  token_dict.set("/",5)
  token_dict.set("<",6)
  token_dict.set("<=",7)
  token_dict.set(">",8)
  token_dict.set(">=",9)
  token_dict.set("!=",10)
  token_dict.set("=",11)
  token_dict.set("==",12)
  token_dict.set("+",13)
  token_dict.set("-",14)
  token_dict.set("*",15)
  token_dict.set(";",16)
  token_dict.set(",",17)
  token_dict.set("(",18)
  token_dict.set(")",19)
  token_dict.set("[",20)
  token_dict.set("]",21)
  token_dict.set("{",22)
  token_dict.set("}",23)

//initialize token list
var token_list = [];
var identifier_list = [];
var number_list = [];
var id_index = 0;
var num_index = 0;
//function to find if identifier is keyword, as per improvements found in slide 65 of chapter 2
function isKeyword(lexeme){
  switch (lexeme){
    case "else":
      return true;      
    case "if":
      return true;
    case "int":
      return true;
    case "return":
      return true;
    case "void":
      return true;
    case "while":
      return true;
    case "input":
      return true;
    case "output":
      return true;
    default: 
      return false
  }
}

//function to add token to a list when matched
function isToken(lexeme){
  var token = new Object();   
  var identifier = new Object();
  var number = new Object();
  if (lexeme.match(/\s+/)){
    return 0;       
  }
  else{
    if (lexeme.match(/[a-zA-Z]+/)) {
      if(!isKeyword(lexeme)) {
        identifier["id"] = id_index++;
        identifier["value"] = lexeme;        
        token["type"] =  "identifier";        
        token["value"] = lexeme;
        token["token_id"] = token_dict.get("identifier")
        identifier_list.push(identifier)
      }
      else{
        token["value"] = lexeme;
        token["type"] =  "keyword";                        
      }
    }
    else if (lexeme.match(/[0-9]+/)){
      number["id"] = num_index++;
      number["value"] = lexeme;
      token["type"] =  "number";
      token["token_id"] =  token_dict.get("number")                  
      number_list.push(number)
    }
    else if (lexeme.match(/([\>\<\!\=]{1}\=|\/\*|\*\/|[\/\*\-\+\;\,\{\}\[\]\(\)\>\<\=])/)){
      token["value"] = lexeme;
      token["token_id"] =  token_dict.get(lexeme)      
    }
    token_list.push(token)    
  }      
}

//function to scan file and retrieve information
function scan() {
  var lexeme = file.toString().match(regex_splitter)
  for (i in lexeme){
    isToken(lexeme[i])
  }  
  console.log(token_list)
  console.log(identifier_list)
  console.log(number_list)
}

exports.scan = scan;
