// @bun
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __hasOwnProp = Object.prototype.hasOwnProperty;
function __accessProp(key) {
  return this[key];
}
var __toESMCache_node;
var __toESMCache_esm;
var __toESM = (mod, isNodeMode, target) => {
  var canCache = mod != null && typeof mod === "object";
  if (canCache) {
    var cache = isNodeMode ? __toESMCache_node ??= new WeakMap : __toESMCache_esm ??= new WeakMap;
    var cached = cache.get(mod);
    if (cached)
      return cached;
  }
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: __accessProp.bind(mod, key),
        enumerable: true
      });
  if (canCache)
    cache.set(mod, to);
  return to;
};
var __toCommonJS = (from) => {
  var entry = (__moduleCache ??= new WeakMap).get(from), desc;
  if (entry)
    return entry;
  entry = __defProp({}, "__esModule", { value: true });
  if (from && typeof from === "object" || typeof from === "function") {
    for (var key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(entry, key))
        __defProp(entry, key, {
          get: __accessProp.bind(from, key),
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
  }
  __moduleCache.set(from, entry);
  return entry;
};
var __moduleCache;
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __returnValue = (v) => v;
function __exportSetter(name, newValue) {
  this[name] = __returnValue.bind(null, newValue);
}
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: __exportSetter.bind(all, name)
    });
};
var __esm = (fn2, res) => () => (fn2 && (res = fn2(fn2 = 0)), res);
var __require = import.meta.require;

// node_modules/arity-n/0.js
var require_0 = __commonJS((exports, module) => {
  module.exports = function(fn2) {
    return function() {
      return fn2.apply(null, arguments);
    };
  };
});

// node_modules/arity-n/1.js
var require_1 = __commonJS((exports, module) => {
  module.exports = function(fn2) {
    return function(a) {
      return fn2.apply(null, arguments);
    };
  };
});

// node_modules/arity-n/2.js
var require_2 = __commonJS((exports, module) => {
  module.exports = function(fn2) {
    return function(a, b) {
      return fn2.apply(null, arguments);
    };
  };
});

// node_modules/arity-n/3.js
var require_3 = __commonJS((exports, module) => {
  module.exports = function(fn2) {
    return function(a, b, c) {
      return fn2.apply(null, arguments);
    };
  };
});

// node_modules/arity-n/4.js
var require_4 = __commonJS((exports, module) => {
  module.exports = function(fn2) {
    return function(a, b, c, d) {
      return fn2.apply(null, arguments);
    };
  };
});

// node_modules/arity-n/5.js
var require_5 = __commonJS((exports, module) => {
  module.exports = function(fn2) {
    return function(a, b, c, d, e) {
      return fn2.apply(null, arguments);
    };
  };
});

// node_modules/arity-n/N.js
var require_N = __commonJS((exports, module) => {
  var arityFn = [
    require_0(),
    require_1(),
    require_2(),
    require_3(),
    require_4(),
    require_5()
  ];
  module.exports = function(fn2, n) {
    if (n && n <= 5) {
      return arityFn[n](fn2);
    } else {
      return fn2;
    }
  };
});

// node_modules/compose-function/index.js
var require_compose_function = __commonJS((exports, module) => {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = compose;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  var _arityN = require_N();
  var _arityN2 = _interopRequireDefault(_arityN);
  var compose2 = function compose22(f, g) {
    return function() {
      return f(g.apply(undefined, arguments));
    };
  };
  function compose() {
    for (var _len = arguments.length, functions = Array(_len), _key = 0;_key < _len; _key++) {
      functions[_key] = arguments[_key];
    }
    var funcs = functions.filter(function(fn2) {
      return typeof fn2 === "function";
    });
    var lastIdx = funcs.length - 1;
    var arity2 = 0;
    if (funcs.length <= 0) {
      throw new Error("No funcs passed");
    }
    if (lastIdx >= 0 && funcs[lastIdx]) {
      arity2 = funcs[lastIdx].length;
    }
    return (0, _arityN2["default"])(funcs.reduce(compose2), arity2);
  }
  module.exports = exports["default"];
});

// node_modules/bash-parser/src/shell-lexer.js
var require_shell_lexer = __commonJS((exports, module) => {
  var compose = require_compose_function();
  var posixShellLexer = (mode, options) => ({
    lex() {
      const item = this.tokenizer.next();
      const tk = item.value;
      const tkType = tk.originalType;
      const text = tk.value;
      this.yytext = { text };
      if (tk.expansion) {
        this.yytext.expansion = tk.expansion;
      }
      if (tk.originalText) {
        this.yytext.originalText = tk.originalText;
      }
      if (tk.type) {
        this.yytext.type = tk.type;
      }
      if (tk.maybeSimpleCommandName) {
        this.yytext.maybeSimpleCommandName = tk.maybeSimpleCommandName;
      }
      if (tk.joined) {
        this.yytext.joined = tk.joined;
      }
      if (tk.fieldIdx !== undefined) {
        this.yytext.fieldIdx = tk.fieldIdx;
      }
      if (options.insertLOC && tk.loc) {
        this.yytext.loc = tk.loc;
      }
      if (tk.loc) {
        this.yylineno = tk.loc.start.row - 1;
      }
      return tkType;
    },
    setInput(source) {
      const tokenizer = mode.tokenizer(options);
      let previousPhases = [tokenizer];
      const phases = [tokenizer].concat(mode.lexerPhases.map((phase) => {
        const ph = phase(options, mode, previousPhases);
        previousPhases = previousPhases.concat(ph);
        return ph;
      }));
      const tokenize = compose.apply(null, phases.reverse());
      this.tokenizer = tokenize(source);
    }
  });
  module.exports = posixShellLexer;
});

// node_modules/bash-parser/src/utils/logger-phase.js
var require_logger_phase = __commonJS((exports, module) => {
  var logger = (name) => () => function* (tokens) {
    for (const tk of tokens) {
      if (!tk) {
        console.log(`In ${name} token null.`);
      }
      console.log(name, "<<<", tk, ">>>");
      yield tk;
    }
  };
  module.exports = logger;
});

// node_modules/has-own-property/index.js
var require_has_own_property = __commonJS((exports, module) => {
  var _hasOwnProperty = Object.prototype.hasOwnProperty;
  module.exports = function hasOwnProperty(obj, prop) {
    return _hasOwnProperty.call(obj, prop);
  };
});

// node_modules/filter-obj/index.js
var require_filter_obj = __commonJS((exports, module) => {
  module.exports = function(obj, predicate) {
    var ret = {};
    var keys = Object.keys(obj);
    var isArr = Array.isArray(predicate);
    for (var i = 0;i < keys.length; i++) {
      var key = keys[i];
      var val = obj[key];
      if (isArr ? predicate.indexOf(key) !== -1 : predicate(key, val, obj)) {
        ret[key] = val;
      }
    }
    return ret;
  };
});

// node_modules/bash-parser/src/modes/posix/enums/operators.js
var require_operators = __commonJS((exports, module) => {
  var operators = {
    "&": "AND",
    "|": "PIPE",
    "(": "OPEN_PAREN",
    ")": "CLOSE_PAREN",
    ">": "GREAT",
    "<": "LESS",
    "&&": "AND_IF",
    "||": "OR_IF",
    ";;": "DSEMI",
    "<<": "DLESS",
    ">>": "DGREAT",
    "<&": "LESSAND",
    ">&": "GREATAND",
    "<>": "LESSGREAT",
    "<<-": "DLESSDASH",
    ">|": "CLOBBER",
    ";": "SEMICOLON"
  };
  module.exports = operators;
});

// node_modules/bash-parser/src/utils/tokens.js
var require_tokens = __commonJS((exports) => {
  var hasOwnProperty = require_has_own_property();
  var filter = require_filter_obj();
  var operators = require_operators();

  class Token {
    constructor(fields) {
      const definedFields = filter(fields, (key, value) => value !== undefined);
      Object.assign(this, definedFields);
      if (this._ === undefined) {
        this._ = {};
      }
    }
    is(type) {
      return this.type === type;
    }
    appendTo(chunk) {
      return new Token(Object.assign({}, this, { value: this.value + chunk }));
    }
    changeTokenType(type, value) {
      return new Token({ type, value, loc: this.loc, _: this._, expansion: this.expansion });
    }
    setValue(value) {
      return new Token(Object.assign({}, this, { value }));
    }
    alterValue(value) {
      return new Token(Object.assign({}, this, { value, originalText: this.originalText || this.value }));
    }
    addExpansions() {
      return new Token(Object.assign({}, this, { expansion: [] }));
    }
    setExpansions(expansion) {
      return new Token(Object.assign({}, this, { expansion }));
    }
  }
  exports.token = (args2) => new Token(args2);
  function mkToken(type, value, loc, expansion) {
    const tk = new Token({ type, value, loc });
    if (expansion && expansion.length) {
      tk.expansion = expansion;
    }
    return tk;
  }
  exports.mkToken = mkToken;
  exports.mkFieldSplitToken = function mkFieldSplitToken(joinedTk, value, fieldIdx) {
    const tk = new Token({
      type: joinedTk.type,
      value,
      joined: joinedTk.value,
      fieldIdx,
      loc: joinedTk.loc,
      expansion: joinedTk.expansion,
      originalText: joinedTk.originalText
    });
    return tk;
  };
  exports.appendTo = (tk, chunk) => tk.appendTo(chunk);
  exports.changeTokenType = (tk, type, value) => tk.changeTokenType(type, value);
  exports.setValue = (tk, value) => tk.setValue(value);
  exports.alterValue = (tk, value) => tk.alterValue(value);
  exports.addExpansions = (tk) => tk.addExpansions();
  exports.setExpansions = (tk, expansion) => tk.setExpansions(expansion);
  exports.tokenOrEmpty = function tokenOrEmpty(state) {
    if (state.current !== "" && state.current !== `
`) {
      const expansion = (state.expansion || []).map((xp) => {
        return Object.assign({}, xp, { loc: {
          start: xp.loc.start.char - state.loc.start.char,
          end: xp.loc.end.char - state.loc.start.char
        } });
      });
      const token = mkToken("TOKEN", state.current, {
        start: Object.assign({}, state.loc.start),
        end: Object.assign({}, state.loc.previous)
      }, expansion);
      return [token];
    }
    return [];
  };
  exports.operatorTokens = function operatorTokens(state) {
    const token = mkToken(operators[state.current], state.current, {
      start: Object.assign({}, state.loc.start),
      end: Object.assign({}, state.loc.previous)
    });
    return [token];
  };
  exports.newLine = function newLine() {
    return mkToken("NEWLINE", `
`);
  };
  exports.continueToken = function continueToken(expectedChar) {
    return mkToken("CONTINUE", expectedChar);
  };
  exports.eof = function eof() {
    return mkToken("EOF", "");
  };
  exports.isPartOfOperator = function isPartOfOperator(text) {
    return Object.keys(operators).some((op) => op.slice(0, text.length) === text);
  };
  exports.isOperator = function isOperator(text) {
    return hasOwnProperty(operators, text);
  };
  exports.applyTokenizerVisitor = (visitor) => (tk, idx, iterable) => {
    if (hasOwnProperty(visitor, tk.type)) {
      const visit = visitor[tk.type];
      return visit(tk, iterable);
    }
    if (hasOwnProperty(visitor, "defaultMethod")) {
      const visit = visitor.defaultMethod;
      return visit(tk, iterable);
    }
    return tk;
  };
});

// node_modules/bash-parser/src/utils/is-valid-name.js
var require_is_valid_name = __commonJS((exports, module) => {
  module.exports = function isValidName(text) {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(text);
  };
});

// node_modules/curry/curry.js
var require_curry = __commonJS((exports, module) => {
  var slice = Array.prototype.slice;
  var toArray = function(a) {
    return slice.call(a);
  };
  var tail = function(a) {
    return slice.call(a, 1);
  };
  var createFn = function(fn2, args2, totalArity) {
    var remainingArity = totalArity - args2.length;
    switch (remainingArity) {
      case 0:
        return function() {
          return processInvocation(fn2, concatArgs(args2, arguments), totalArity);
        };
      case 1:
        return function(a) {
          return processInvocation(fn2, concatArgs(args2, arguments), totalArity);
        };
      case 2:
        return function(a, b) {
          return processInvocation(fn2, concatArgs(args2, arguments), totalArity);
        };
      case 3:
        return function(a, b, c) {
          return processInvocation(fn2, concatArgs(args2, arguments), totalArity);
        };
      case 4:
        return function(a, b, c, d) {
          return processInvocation(fn2, concatArgs(args2, arguments), totalArity);
        };
      case 5:
        return function(a, b, c, d, e) {
          return processInvocation(fn2, concatArgs(args2, arguments), totalArity);
        };
      case 6:
        return function(a, b, c, d, e, f) {
          return processInvocation(fn2, concatArgs(args2, arguments), totalArity);
        };
      case 7:
        return function(a, b, c, d, e, f, g) {
          return processInvocation(fn2, concatArgs(args2, arguments), totalArity);
        };
      case 8:
        return function(a, b, c, d, e, f, g, h) {
          return processInvocation(fn2, concatArgs(args2, arguments), totalArity);
        };
      case 9:
        return function(a, b, c, d, e, f, g, h, i) {
          return processInvocation(fn2, concatArgs(args2, arguments), totalArity);
        };
      case 10:
        return function(a, b, c, d, e, f, g, h, i, j) {
          return processInvocation(fn2, concatArgs(args2, arguments), totalArity);
        };
      default:
        return createEvalFn(fn2, args2, remainingArity);
    }
  };
  var concatArgs = function(args1, args2) {
    return args1.concat(toArray(args2));
  };
  var createEvalFn = function(fn, args, arity) {
    var argList = makeArgList(arity);
    var fnStr = "false||" + "function(" + argList + "){ return processInvocation(fn, concatArgs(args, arguments)); }";
    return eval(fnStr);
  };
  var makeArgList = function(len) {
    var a = [];
    for (var i = 0;i < len; i += 1)
      a.push("a" + i.toString());
    return a.join(",");
  };
  var trimArrLength = function(arr, length) {
    if (arr.length > length)
      return arr.slice(0, length);
    else
      return arr;
  };
  var processInvocation = function(fn2, argsArr, totalArity) {
    argsArr = trimArrLength(argsArr, totalArity);
    if (argsArr.length === totalArity)
      return fn2.apply(null, argsArr);
    return createFn(fn2, argsArr, totalArity);
  };
  var curry = function(fn2) {
    return createFn(fn2, [], fn2.length);
  };
  curry.to = curry(function(arity2, fn2) {
    return createFn(fn2, [], arity2);
  });
  curry.adaptTo = curry(function(num, fn2) {
    return curry.to(num, function(context) {
      var args2 = tail(arguments).concat(context);
      return fn2.apply(this, args2);
    });
  });
  curry.adapt = function(fn2) {
    return curry.adaptTo(fn2.length, fn2);
  };
  module.exports = curry;
});

// node_modules/iterable-transform-replace/index.js
var require_iterable_transform_replace = __commonJS((exports, module) => {
  function _interopDefault(ex) {
    return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
  }
  var curry = _interopDefault(require_curry());
  function replace(oldItem, newItem, array) {
    return array.map((item) => {
      if (item === oldItem) {
        return newItem;
      }
      return item;
    });
  }
  var main = curry(replace);
  module.exports = main;
});

// node_modules/bash-parser/src/utils/index.js
var require_utils = __commonJS((exports) => {
  exports.loggerPhase = require_logger_phase();
  exports.tokens = require_tokens();
  exports.isValidName = require_is_valid_name();
  exports.replaceRule = require_iterable_transform_replace();
});

// node_modules/identity-function/index.js
var require_identity_function = __commonJS((exports, module) => {
  module.exports = function(x) {
    return x;
  };
});

// node_modules/is-iterable/index.js
var require_is_iterable = __commonJS((exports, module) => {
  module.exports = function(val) {
    return typeof Symbol !== "undefined" && Symbol && "iterator" in Symbol && val != null && typeof val[Symbol.iterator] === "function";
  };
});

// node_modules/map-iterable/index.js
var require_map_iterable = __commonJS((exports, module) => {
  var curry = require_curry();
  var isIterable = require_is_iterable();
  function initDefault(data) {
    return data;
  }
  function map(options, data) {
    if (typeof options !== "function" && (typeof options !== "object" || options === null)) {
      throw new TypeError("Callback argument must be a function or option object");
    }
    if (!isIterable(data)) {
      throw new TypeError("Data argument must be an iterable");
    }
    let idx = 0;
    const init = options.init || initDefault;
    const callback = options.callback || options;
    const ctx = init(data);
    const dataIterator = data[Symbol.iterator]();
    return {
      [Symbol.iterator]() {
        return this;
      },
      next() {
        const item = dataIterator.next();
        if (!item.done) {
          item.value = callback(item.value, idx++, ctx);
        }
        return item;
      }
    };
  }
  module.exports = curry(map);
});

// node_modules/object-values/index.js
var require_object_values = __commonJS((exports, module) => {
  module.exports = function(obj) {
    var keys = Object.keys(obj);
    var ret = [];
    for (var i = 0;i < keys.length; i++) {
      ret.push(obj[keys[i]]);
    }
    return ret;
  };
});

// node_modules/transform-spread-iterable/index.js
var require_transform_spread_iterable = __commonJS((exports, module) => {
  function* spread(source) {
    for (const item of source) {
      if (typeof item[Symbol.iterator] === "function") {
        yield* item;
      } else {
        yield item;
      }
    }
  }
  module.exports = spread;
});

// node_modules/bash-parser/src/modes/bash/rules/alias-substitution.js
var require_alias_substitution = __commonJS((exports, module) => {
  var compose = require_compose_function();
  var identity = require_identity_function();
  var map = require_map_iterable();
  var values = require_object_values();
  var merge = require_transform_spread_iterable();
  var tokens = require_tokens();
  var expandAlias = (preAliasLexer, resolveAlias, reservedWords) => {
    function* tryExpandToken(token, expandingAliases) {
      if (expandingAliases.indexOf(token.value) !== -1) {
        yield token;
        return;
      }
      const result = resolveAlias(token.value);
      if (result === undefined) {
        yield token;
      } else {
        for (const newToken of preAliasLexer(result)) {
          if (newToken.is("WORD") || reservedWords.some((word) => newToken.is(word))) {
            yield* tryExpandToken(newToken, expandingAliases.concat(token.value));
          } else if (!newToken.is("EOF")) {
            yield newToken;
          }
        }
      }
    }
    function expandToken(tk) {
      return Array.from(tryExpandToken(tk, []));
    }
    const visitor = {
      WORD: expandToken
    };
    reservedWords.forEach((w) => {
      visitor[w] = expandToken;
    });
    return visitor;
  };
  module.exports = (options, mode, previousPhases) => {
    if (typeof options.resolveAlias !== "function") {
      return identity;
    }
    const preAliasLexer = compose.apply(null, previousPhases.reverse());
    const visitor = expandAlias(preAliasLexer, options.resolveAlias, values(mode.enums.reservedWords));
    return compose(merge, map(tokens.applyTokenizerVisitor(visitor)));
  };
});

// node_modules/bash-parser/src/modes/bash/index.js
var require_bash = __commonJS((exports, module) => {
  var bashAliasSubstitution = require_alias_substitution();
  var name = "[a-zA-Z_][a-zA-Z0-9_]*";
  var parameterOperators = {
    [`^(${name}):([^:]*):?([^:]*)$`]: {
      op: "substring",
      parameter: (m) => m[1],
      offset: (m) => parseInt(m[2], 10),
      length: (m) => parseInt(m[3], 10) || undefined
    },
    [`^!(${name})(\\*|@)$`]: {
      op: "prefix",
      prefix: (m) => m[1],
      expandWords: (m) => m[2] === "@",
      parameter: () => {
        return;
      }
    },
    [`^!(${name})(\\[\\*\\]|\\[@\\])$`]: {
      op: "arrayIndices",
      parameter: (m) => m[1],
      expandWords: (m) => m[2] === "[@]"
    },
    [`^(${name})\\/(\\/)?([^\\/])+\\/(.*)$`]: {
      op: "stringReplace",
      parameter: (m) => m[1],
      substitute: (m) => m[3],
      replace: (m) => m[4],
      globally: (m) => m[2] === "/"
    },
    [`^(${name})(\\^\\^|\\^|,,|,)(.*)$`]: {
      op: "caseChange",
      parameter: (m) => m[1],
      pattern: (m) => m[3] || "?",
      case: (m) => m[2][0] === "," ? "lower" : "upper",
      globally: (m) => m[2].length === 2
    },
    [`^(${name})@([Q|E|P|A|a])$`]: {
      op: "transformation",
      parameter: (m) => m[1],
      kind: (m) => {
        switch (m[2]) {
          case "Q":
            return "quoted";
          case "E":
            return "escape";
          case "P":
            return "prompt";
          case "A":
            return "assignment";
          case "a":
            return "flags";
          default:
            return "unknown";
        }
      }
    },
    [`^!(.+)$`]: {
      op: "indirection",
      word: (m) => m[1],
      parameter: () => {
        return;
      }
    }
  };
  module.exports = {
    inherits: "posix",
    init: (posixMode, utils) => {
      const phaseCatalog = Object.assign({}, posixMode.phaseCatalog, { bashAliasSubstitution });
      const lexerPhases = utils.replaceRule(phaseCatalog.aliasSubstitution, bashAliasSubstitution, posixMode.lexerPhases);
      const bashOperators = Object.assign(parameterOperators, posixMode.enums.parameterOperators);
      const enums = Object.assign({}, posixMode.enums, { parameterOperators: bashOperators });
      return Object.assign({}, posixMode, { phaseCatalog, lexerPhases, enums });
    }
  };
});

// node_modules/is-number/index.js
var require_is_number = __commonJS((exports, module) => {
  /*!
   * is-number <https://github.com/jonschlinkert/is-number>
   *
   * Copyright (c) 2014-2017, Jon Schlinkert.
   * Released under the MIT License.
   */
  module.exports = function isNumber(num) {
    var type = typeof num;
    if (type === "string" || num instanceof String) {
      if (!num.trim())
        return false;
    } else if (type !== "number" && !(num instanceof Number)) {
      return false;
    }
    return num - num + 1 >= 0;
  };
});

// node_modules/array-last/index.js
var require_array_last = __commonJS((exports, module) => {
  /*!
   * array-last <https://github.com/jonschlinkert/array-last>
   *
   * Copyright (c) 2014-2017, Jon Schlinkert.
   * Released under the MIT License.
   */
  var isNumber = require_is_number();
  module.exports = function last(arr, n) {
    if (!Array.isArray(arr)) {
      throw new Error("expected the first argument to be an array");
    }
    var len = arr.length;
    if (len === 0) {
      return null;
    }
    n = isNumber(n) ? +n : 1;
    if (n === 1) {
      return arr[len - 1];
    }
    var res = new Array(n);
    while (n--) {
      res[n] = arr[--len];
    }
    return res;
  };
});

// node_modules/bash-parser/src/modes/posix/ast-builder.js
var require_ast_builder = __commonJS((exports, module) => {
  module.exports = (options) => {
    const builder = {};
    mkListHelper(builder, "caseList");
    mkListHelper(builder, "pattern");
    mkListHelper(builder, "prefix");
    mkListHelper(builder, "suffix");
    builder.caseItem = (pattern, body, locStart, locEnd) => {
      const type = "CaseItem";
      const node = { type, pattern, body };
      if (options.insertLOC) {
        node.loc = setLocEnd(setLocStart({}, locStart), locEnd);
      }
      return node;
    };
    builder.caseClause = (clause, cases, locStart, locEnd) => {
      const type = "Case";
      const node = { type, clause };
      if (cases) {
        Object.assign(node, { cases });
      }
      if (options.insertLOC) {
        node.loc = setLocEnd(setLocStart({}, locStart), locEnd);
      }
      return node;
    };
    builder.doGroup = (group, locStart, locEnd) => {
      if (options.insertLOC) {
        setLocEnd(setLocStart(group.loc, locStart), locEnd);
      }
      return group;
    };
    builder.braceGroup = (group, locStart, locEnd) => {
      if (options.insertLOC) {
        setLocEnd(setLocStart(group.loc, locStart), locEnd);
      }
      return group;
    };
    builder.list = (logicalExpression) => {
      const node = { type: "Script", commands: [logicalExpression] };
      if (options.insertLOC) {
        node.loc = setLocEnd(setLocStart({}, logicalExpression.loc), logicalExpression.loc);
      }
      return node;
    };
    function isAsyncSeparator(separator) {
      return separator.text.indexOf("&") !== -1;
    }
    const last = require_array_last();
    builder.checkAsync = (list, separator) => {
      if (isAsyncSeparator(separator)) {
        last(list.commands).async = true;
      }
      return list;
    };
    builder.listAppend = (list, logicalExpression, separator) => {
      if (isAsyncSeparator(separator)) {
        last(list.commands).async = true;
      }
      list.commands.push(logicalExpression);
      if (options.insertLOC) {
        setLocEnd(list.loc, logicalExpression.loc);
      }
      return list;
    };
    builder.addRedirections = (compoundCommand, redirectList) => {
      compoundCommand.redirections = redirectList;
      if (options.insertLOC) {
        const lastRedirect = redirectList[redirectList.length - 1];
        setLocEnd(compoundCommand.loc, lastRedirect.loc);
      }
      return compoundCommand;
    };
    builder.term = (logicalExpression) => {
      const node = { type: "CompoundList", commands: [logicalExpression] };
      if (options.insertLOC) {
        node.loc = setLocEnd(setLocStart({}, logicalExpression.loc), logicalExpression.loc);
      }
      return node;
    };
    builder.termAppend = (term, logicalExpression, separator) => {
      if (isAsyncSeparator(separator)) {
        last(term.commands).async = true;
      }
      term.commands.push(logicalExpression);
      setLocEnd(term.loc, logicalExpression.loc);
      return term;
    };
    builder.subshell = (list, locStart, locEnd) => {
      const node = { type: "Subshell", list };
      if (options.insertLOC) {
        node.loc = setLocEnd(setLocStart({}, locStart), locEnd);
      }
      return node;
    };
    builder.pipeSequence = (command) => {
      const node = { type: "Pipeline", commands: [command] };
      if (options.insertLOC) {
        node.loc = setLocEnd(setLocStart({}, command.loc), command.loc);
      }
      return node;
    };
    builder.pipeSequenceAppend = (pipe, command) => {
      pipe.commands.push(command);
      if (options.insertLOC) {
        setLocEnd(pipe.loc, command.loc);
      }
      return pipe;
    };
    builder.bangPipeLine = (pipe) => {
      const bang = true;
      if (pipe.commands.length === 1) {
        return Object.assign(pipe.commands[0], { bang });
      }
      return Object.assign(pipe, { bang });
    };
    builder.pipeLine = (pipe) => {
      if (pipe.commands.length === 1) {
        return pipe.commands[0];
      }
      return pipe;
    };
    builder.andAndOr = (left, right) => {
      const node = { type: "LogicalExpression", op: "and", left, right };
      if (options.insertLOC) {
        node.loc = setLocEnd(setLocStart({}, left.loc), right.loc);
      }
      return node;
    };
    builder.orAndOr = (left, right) => {
      const node = { type: "LogicalExpression", op: "or", left, right };
      if (options.insertLOC) {
        node.loc = setLocEnd(setLocStart({}, left.loc), right.loc);
      }
      return node;
    };
    builder.forClause = (name, wordlist, doGroup, locStart) => {
      const node = { type: "For", name, wordlist, do: doGroup };
      if (options.insertLOC) {
        node.loc = setLocEnd(setLocStart({}, locStart), doGroup.loc);
      }
      return node;
    };
    builder.forClauseDefault = (name, doGroup, locStart) => {
      const node = { type: "For", name, do: doGroup };
      if (options.insertLOC) {
        node.loc = setLocEnd(setLocStart({}, locStart), doGroup.loc);
      }
      return node;
    };
    builder.functionDefinition = (name, body) => {
      const node = { type: "Function", name };
      node.body = body[0];
      if (body[1]) {
        node.redirections = body[1];
      }
      const endLoc = body[1] || body[0];
      if (options.insertLOC) {
        node.loc = setLocEnd(setLocStart({}, name.loc), endLoc.loc);
      }
      return node;
    };
    builder.elseClause = (compoundList, locStart) => {
      if (options.insertLOC) {
        setLocStart(compoundList.loc, locStart.loc);
      }
      return compoundList;
    };
    builder.ifClause = (clause, then, elseBranch, locStart, locEnd) => {
      const node = { type: "If", clause, then };
      if (elseBranch) {
        node.else = elseBranch;
      }
      if (options.insertLOC) {
        node.loc = setLocEnd(setLocStart({}, locStart), locEnd);
      }
      return node;
    };
    builder.while = (clause, body, whileWord) => {
      const node = { type: "While", clause, do: body };
      if (options.insertLOC) {
        node.loc = setLocEnd(setLocStart({}, whileWord.loc), body.loc);
      }
      return node;
    };
    builder.until = (clause, body, whileWord) => {
      const node = { type: "Until", clause, do: body };
      if (options.insertLOC) {
        node.loc = setLocEnd(setLocStart({}, whileWord.loc), body.loc);
      }
      return node;
    };
    builder.commandName = (name) => name;
    builder.commandAssignment = function commandAssignment(prefix) {
      return builder.command(prefix);
    };
    builder.command = function command(prefix, command, suffix) {
      const node = { type: "Command" };
      if (command) {
        node.name = command;
      }
      if (options.insertLOC) {
        node.loc = {};
        if (prefix) {
          const firstPrefix = prefix[0];
          node.loc.start = firstPrefix.loc.start;
        } else {
          node.loc.start = command.loc.start;
        }
        if (suffix) {
          const lastSuffix = suffix[suffix.length - 1];
          node.loc.end = lastSuffix.loc.end;
        } else if (command) {
          node.loc.end = command.loc.end;
        } else {
          const lastPrefix = prefix[prefix.length - 1];
          node.loc.end = lastPrefix.loc.end;
        }
      }
      if (prefix) {
        node.prefix = prefix;
      }
      if (suffix) {
        node.suffix = suffix;
      }
      return node;
    };
    builder.ioRedirect = (op, file) => {
      const node = { type: "Redirect", op, file };
      if (options.insertLOC) {
        node.loc = setLocEnd(setLocStart({}, op.loc), file.loc);
      }
      return node;
    };
    builder.numberIoRedirect = (ioRedirect, numberIo) => {
      const node = Object.assign({}, ioRedirect, { numberIo });
      if (options.insertLOC) {
        setLocStart(node.loc, numberIo.loc);
      }
      return node;
    };
    return builder;
  };
  function setLocStart(target, source) {
    if (source) {
      target.start = source.start;
    }
    return target;
  }
  function setLocEnd(target, source) {
    if (source) {
      target.end = source.end;
    }
    return target;
  }
  function mkListHelper(builder, listName) {
    builder[listName] = (item) => {
      return [item];
    };
    builder[`${listName}Append`] = (list, item) => {
      list.push(item);
      return list;
    };
  }
});

// node_modules/deep-freeze/index.js
var require_deep_freeze = __commonJS((exports, module) => {
  module.exports = function deepFreeze(o) {
    Object.freeze(o);
    Object.getOwnPropertyNames(o).forEach(function(prop) {
      if (o.hasOwnProperty(prop) && o[prop] !== null && (typeof o[prop] === "object" || typeof o[prop] === "function") && !Object.isFrozen(o[prop])) {
        deepFreeze(o[prop]);
      }
    });
    return o;
  };
});

// node_modules/bash-parser/src/modes/posix/tokenizer/reducers/end.js
var require_end = __commonJS((exports, module) => {
  var eof = require_tokens().eof;
  module.exports = function end() {
    return {
      nextReduction: null,
      tokensToEmit: [eof()]
    };
  };
});

// node_modules/bash-parser/src/modes/posix/tokenizer/reducers/operator.js
var require_operator = __commonJS((exports, module) => {
  var t = require_tokens();
  var isPartOfOperator = t.isPartOfOperator;
  var operatorTokens = t.operatorTokens;
  var isOperator = t.isOperator;
  module.exports = function operator(state, source, reducers) {
    const char = source && source.shift();
    if (char === undefined) {
      if (isOperator(state.current)) {
        return {
          nextReduction: reducers.end,
          tokensToEmit: operatorTokens(state),
          nextState: state.resetCurrent().saveCurrentLocAsStart()
        };
      }
      return reducers.start(state, char);
    }
    if (isPartOfOperator(state.current + char)) {
      return {
        nextReduction: reducers.operator,
        nextState: state.appendChar(char)
      };
    }
    let tokens = [];
    if (isOperator(state.current)) {
      tokens = operatorTokens(state);
      state = state.resetCurrent().saveCurrentLocAsStart();
    }
    const ret = reducers.start(state, [char].concat(source), reducers);
    const nextReduction = ret.nextReduction;
    const tokensToEmit = ret.tokensToEmit;
    const nextState = ret.nextState;
    if (tokensToEmit) {
      tokens = tokens.concat(tokensToEmit);
    }
    return {
      nextReduction,
      tokensToEmit: tokens,
      nextState
    };
  };
});

// node_modules/bash-parser/src/modes/posix/tokenizer/reducers/comment.js
var require_comment = __commonJS((exports, module) => {
  var newLine = require_tokens().newLine;
  module.exports = function comment(state, source, reducers) {
    const char = source && source.shift();
    if (char === undefined) {
      return {
        nextReduction: reducers.end,
        nextState: state
      };
    }
    if (char === `
`) {
      return {
        tokensToEmit: [newLine()],
        nextReduction: reducers.start,
        nextState: state
      };
    }
    return {
      nextReduction: comment,
      nextState: state
    };
  };
});

// node_modules/bash-parser/src/modes/posix/tokenizer/reducers/single-quoting.js
var require_single_quoting = __commonJS((exports, module) => {
  var t = require_tokens();
  var tokenOrEmpty = t.tokenOrEmpty;
  var continueToken = t.continueToken;
  module.exports = function singleQuoting(state, source, reducers) {
    const char = source && source.shift();
    if (char === undefined) {
      return {
        nextState: state,
        nextReduction: null,
        tokensToEmit: tokenOrEmpty(state).concat(continueToken("'"))
      };
    }
    if (char === "'") {
      return {
        nextReduction: reducers.start,
        nextState: state.appendChar(char)
      };
    }
    return {
      nextReduction: reducers.singleQuoting,
      nextState: state.appendChar(char)
    };
  };
});

// node_modules/bash-parser/src/modes/posix/tokenizer/reducers/double-quoting.js
var require_double_quoting = __commonJS((exports, module) => {
  var t = require_tokens();
  var tokenOrEmpty = t.tokenOrEmpty;
  var continueToken = t.continueToken;
  module.exports = function doubleQuoting(state, source, reducers) {
    const char = source && source.shift();
    state = state.setPreviousReducer(doubleQuoting);
    if (char === undefined) {
      return {
        nextReduction: null,
        tokensToEmit: tokenOrEmpty(state).concat(continueToken('"')),
        nextState: state
      };
    }
    if (!state.escaping && char === "\\") {
      return {
        nextReduction: doubleQuoting,
        nextState: state.setEscaping(true).appendChar(char)
      };
    }
    if (!state.escaping && char === '"') {
      return {
        nextReduction: reducers.start,
        nextState: state.setPreviousReducer(reducers.start).appendChar(char)
      };
    }
    if (!state.escaping && char === "$") {
      return {
        nextReduction: reducers.expansionStart,
        nextState: state.appendEmptyExpansion().appendChar(char)
      };
    }
    if (!state.escaping && char === "`") {
      return {
        nextReduction: reducers.expansionCommandTick,
        nextState: state.appendEmptyExpansion().appendChar(char)
      };
    }
    return {
      nextReduction: reducers.doubleQuoting,
      nextState: state.setEscaping(false).appendChar(char)
    };
  };
});

// node_modules/bash-parser/src/modes/posix/tokenizer/reducers/expansion-start.js
var require_expansion_start = __commonJS((exports, module) => {
  function isSpecialParameter(char) {
    return char.match(/^[0-9\-!@#\?\*\$]$/);
  }
  module.exports = function expansionStart(state, source, reducers) {
    const char = source && source.shift();
    if (char === "{") {
      return {
        nextReduction: reducers.expansionParameterExtended,
        nextState: state.appendChar(char)
      };
    }
    if (char === "(") {
      return {
        nextReduction: reducers.expansionCommandOrArithmetic,
        nextState: state.appendChar(char)
      };
    }
    if (char.match(/[a-zA-Z_]/)) {
      return {
        nextReduction: reducers.expansionParameter,
        nextState: state.appendChar(char).replaceLastExpansion({
          parameter: char,
          type: "parameter_expansion"
        })
      };
    }
    if (isSpecialParameter(char)) {
      return reducers.expansionSpecialParameter(state, [char].concat(source));
    }
    return state.previousReducer(state, [char].concat(source));
  };
});

// node_modules/bash-parser/src/modes/posix/tokenizer/reducers/expansion-command-tick.js
var require_expansion_command_tick = __commonJS((exports, module) => {
  var last = require_array_last();
  var t = require_tokens();
  var continueToken = t.continueToken;
  module.exports = function expansionCommandTick(state, source, reducers) {
    const char = source && source.shift();
    const xp = last(state.expansion);
    if (!state.escaping && char === "`") {
      return {
        nextReduction: state.previousReducer,
        nextState: state.appendChar(char).replaceLastExpansion({
          type: "command_expansion",
          loc: Object.assign({}, xp.loc, { end: state.loc.current })
        })
      };
    }
    if (char === undefined) {
      return {
        nextReduction: state.previousReducer,
        tokensToEmit: [continueToken("`")],
        nextState: state.replaceLastExpansion({
          loc: Object.assign({}, xp.loc, { end: state.loc.previous })
        })
      };
    }
    if (!state.escaping && char === "\\") {
      return {
        nextReduction: reducers.expansionCommandTick,
        nextState: state.appendChar(char).setEscaping(true)
      };
    }
    return {
      nextReduction: reducers.expansionCommandTick,
      nextState: state.setEscaping(false).appendChar(char).replaceLastExpansion({ command: (xp.command || "") + char })
    };
  };
});

// node_modules/bash-parser/src/modes/posix/tokenizer/reducers/start.js
var require_start = __commonJS((exports, module) => {
  var t = require_tokens();
  var tokenOrEmpty = t.tokenOrEmpty;
  var newLine = t.newLine;
  var isPartOfOperator = t.isPartOfOperator;
  module.exports = function start(state, source, reducers) {
    const char = source && source.shift();
    if (char === undefined) {
      return {
        nextReduction: reducers.end,
        tokensToEmit: tokenOrEmpty(state),
        nextState: state.resetCurrent().saveCurrentLocAsStart()
      };
    }
    if (state.escaping && char === `
`) {
      return {
        nextReduction: reducers.start,
        nextState: state.setEscaping(false).removeLastChar()
      };
    }
    if (!state.escaping && char === "#" && state.current === "") {
      return {
        nextReduction: reducers.comment
      };
    }
    if (!state.escaping && char === `
`) {
      return {
        nextReduction: reducers.start,
        tokensToEmit: tokenOrEmpty(state).concat(newLine()),
        nextState: state.resetCurrent().saveCurrentLocAsStart()
      };
    }
    if (!state.escaping && char === "\\") {
      return {
        nextReduction: reducers.start,
        nextState: state.setEscaping(true).appendChar(char)
      };
    }
    if (!state.escaping && isPartOfOperator(char)) {
      return {
        nextReduction: reducers.operator,
        tokensToEmit: tokenOrEmpty(state),
        nextState: state.setCurrent(char).saveCurrentLocAsStart()
      };
    }
    if (!state.escaping && char === "'") {
      return {
        nextReduction: reducers.singleQuoting,
        nextState: state.appendChar(char)
      };
    }
    if (!state.escaping && char === '"') {
      return {
        nextReduction: reducers.doubleQuoting,
        nextState: state.appendChar(char)
      };
    }
    if (!state.escaping && char.match(/\s/)) {
      return {
        nextReduction: reducers.start,
        tokensToEmit: tokenOrEmpty(state),
        nextState: state.resetCurrent().saveCurrentLocAsStart().setExpansion([])
      };
    }
    if (!state.escaping && char === "$") {
      return {
        nextReduction: reducers.expansionStart,
        nextState: state.appendChar(char).appendEmptyExpansion()
      };
    }
    if (!state.escaping && char === "`") {
      return {
        nextReduction: reducers.expansionCommandTick,
        nextState: state.appendChar(char).appendEmptyExpansion()
      };
    }
    return {
      nextReduction: reducers.start,
      nextState: state.appendChar(char).setEscaping(false)
    };
  };
});

// node_modules/bash-parser/src/modes/posix/tokenizer/reducers/expansion-arithmetic.js
var require_expansion_arithmetic = __commonJS((exports, module) => {
  var last = require_array_last();
  var t = require_tokens();
  var continueToken = t.continueToken;
  module.exports = function expansionArithmetic(state, source) {
    const char = source && source.shift();
    const xp = last(state.expansion);
    if (char === ")" && state.current.slice(-1)[0] === ")") {
      return {
        nextReduction: state.previousReducer,
        nextState: state.appendChar(char).replaceLastExpansion({
          type: "arithmetic_expansion",
          expression: xp.value.slice(0, -1),
          loc: Object.assign({}, xp.loc, { end: state.loc.current })
        }).deleteLastExpansionValue()
      };
    }
    if (char === undefined) {
      return {
        nextReduction: state.previousReducer,
        tokensToEmit: [continueToken("$((")],
        nextState: state.replaceLastExpansion({
          loc: Object.assign({}, xp.loc, { end: state.loc.previous })
        })
      };
    }
    return {
      nextReduction: expansionArithmetic,
      nextState: state.appendChar(char).replaceLastExpansion({ value: (xp.value || "") + char })
    };
  };
});

// node_modules/bash-parser/src/modes/posix/tokenizer/reducers/expansion-special-parameter.js
var require_expansion_special_parameter = __commonJS((exports, module) => {
  var last = require_array_last();
  module.exports = function expansionSpecialParameter(state, source) {
    const char = source && source.shift();
    const xp = last(state.expansion);
    return {
      nextReduction: state.previousReducer,
      nextState: state.appendChar(char).replaceLastExpansion({
        parameter: char,
        type: "parameter_expansion",
        loc: Object.assign({}, xp.loc, { end: state.loc.current })
      })
    };
  };
});

// node_modules/bash-parser/src/modes/posix/tokenizer/reducers/expansion-parameter.js
var require_expansion_parameter = __commonJS((exports, module) => {
  var last = require_array_last();
  module.exports = function expansionParameter(state, source, reducers) {
    const char = source && source.shift();
    const xp = last(state.expansion);
    if (char === undefined) {
      return {
        nextReduction: reducers.start,
        nextState: state.replaceLastExpansion({
          loc: Object.assign({}, xp.loc, { end: state.loc.previous })
        })
      };
    }
    if (char.match(/[0-9a-zA-Z_]/)) {
      return {
        nextReduction: reducers.expansionParameter,
        nextState: state.appendChar(char).replaceLastExpansion({
          parameter: xp.parameter + (char || "")
        })
      };
    }
    return state.previousReducer(state.replaceLastExpansion({ loc: Object.assign({}, xp.loc, { end: state.loc.previous }) }), [char].concat(source), reducers);
  };
});

// node_modules/bash-parser/src/modes/posix/tokenizer/reducers/expansion-command-or-arithmetic.js
var require_expansion_command_or_arithmetic = __commonJS((exports, module) => {
  var last = require_array_last();
  var t = require_tokens();
  var continueToken = t.continueToken;
  module.exports = function expansionCommandOrArithmetic(state, source, reducers) {
    const char = source && source.shift();
    const xp = last(state.expansion);
    if (char === "(" && state.current.slice(-2) === "$(") {
      return {
        nextReduction: reducers.expansionArithmetic,
        nextState: state.appendChar(char)
      };
    }
    if (char === undefined) {
      return {
        nextReduction: state.previousReducer,
        tokensToEmit: [continueToken("$(")],
        nextState: state.replaceLastExpansion({
          loc: Object.assign({}, xp.loc, { end: state.loc.previous })
        })
      };
    }
    if (char === ")") {
      return {
        nextReduction: state.previousReducer,
        nextState: state.appendChar(char).replaceLastExpansion({
          type: "command_expansion",
          loc: Object.assign({}, xp.loc, {
            end: state.loc.current
          })
        })
      };
    }
    return {
      nextReduction: reducers.expansionCommandOrArithmetic,
      nextState: state.appendChar(char).replaceLastExpansion({ command: (xp.command || "") + char })
    };
  };
});

// node_modules/bash-parser/src/modes/posix/tokenizer/reducers/expansion-parameter-extended.js
var require_expansion_parameter_extended = __commonJS((exports, module) => {
  var last = require_array_last();
  var t = require_tokens();
  var continueToken = t.continueToken;
  module.exports = function expansionParameterExtended(state, source, reducers) {
    const char = source && source.shift();
    const xp = last(state.expansion);
    if (char === "}") {
      return {
        nextReduction: state.previousReducer,
        nextState: state.appendChar(char).replaceLastExpansion({
          type: "parameter_expansion",
          loc: Object.assign({}, xp.loc, { end: state.loc.current })
        })
      };
    }
    if (char === undefined) {
      return {
        nextReduction: state.previousReducer,
        tokensToEmit: [continueToken("${")],
        nextState: state.replaceLastExpansion({
          loc: Object.assign({}, xp.loc, { end: state.loc.previous })
        })
      };
    }
    return {
      nextReduction: reducers.expansionParameterExtended,
      nextState: state.appendChar(char).replaceLastExpansion({ parameter: (xp.parameter || "") + char })
    };
  };
});

// node_modules/bash-parser/src/modes/posix/tokenizer/reducers/index.js
var require_reducers = __commonJS((exports, module) => {
  var end = require_end();
  var operator = require_operator();
  var comment = require_comment();
  var singleQuoting = require_single_quoting();
  var doubleQuoting = require_double_quoting();
  var expansionStart = require_expansion_start();
  var expansionCommandTick = require_expansion_command_tick();
  var start = require_start();
  var expansionArithmetic = require_expansion_arithmetic();
  var expansionSpecialParameter = require_expansion_special_parameter();
  var expansionParameter = require_expansion_parameter();
  var expansionCommandOrArithmetic = require_expansion_command_or_arithmetic();
  var expansionParameterExtended = require_expansion_parameter_extended();
  module.exports = {
    end,
    operator,
    comment,
    singleQuoting,
    doubleQuoting,
    expansionStart,
    expansionCommandTick,
    start,
    expansionArithmetic,
    expansionSpecialParameter,
    expansionParameter,
    expansionCommandOrArithmetic,
    expansionParameterExtended
  };
});

// node_modules/bash-parser/src/modes/posix/tokenizer/index.js
var require_tokenizer = __commonJS((exports, module) => {
  var deepFreeze = require_deep_freeze();
  var last = require_array_last();
  var defaultFields = (reducers) => ({
    current: "",
    escaping: false,
    previousReducer: reducers.start,
    loc: {
      start: { col: 1, row: 1, char: 0 },
      previous: null,
      current: { col: 1, row: 1, char: 0 }
    }
  });
  var mkImmutableState = (reducers) => class ImmutableState {
    constructor(fields) {
      Object.assign(this, fields || defaultFields(reducers));
      deepFreeze(this);
    }
    setLoc(loc) {
      return new ImmutableState(Object.assign({}, this, { loc }));
    }
    setEscaping(escaping) {
      return new ImmutableState(Object.assign({}, this, { escaping }));
    }
    setExpansion(expansion) {
      return new ImmutableState(Object.assign({}, this, { expansion }));
    }
    setPreviousReducer(previousReducer) {
      return new ImmutableState(Object.assign({}, this, { previousReducer }));
    }
    setCurrent(current) {
      return new ImmutableState(Object.assign({}, this, { current }));
    }
    appendEmptyExpansion() {
      const expansion = (this.expansion || []).concat({
        loc: { start: Object.assign({}, this.loc.current) }
      });
      return this.setExpansion(expansion);
    }
    appendChar(char) {
      return new ImmutableState(Object.assign({}, this, { current: this.current + char }));
    }
    removeLastChar() {
      return new ImmutableState(Object.assign({}, this, { current: this.current.slice(0, -1) }));
    }
    saveCurrentLocAsStart() {
      return new ImmutableState(Object.assign({}, this, { loc: Object.assign({}, this.loc, { start: this.loc.current }) }));
    }
    resetCurrent() {
      return new ImmutableState(Object.assign({}, this, { current: "" }));
    }
    advanceLoc(char) {
      const loc = Object.assign({}, this.loc, {
        current: Object.assign({}, this.loc.current),
        previous: Object.assign({}, this.loc.current)
      });
      if (char === `
`) {
        loc.current.row++;
        loc.current.col = 1;
      } else {
        loc.current.col++;
      }
      loc.current.char++;
      if (char && char.match(/\s/) && this.current === "") {
        loc.start = Object.assign({}, loc.current);
      }
      return this.setLoc(loc);
    }
  };
  var mkMutableState = (reducers) => class {
    constructor(fields) {
      Object.assign(this, fields || defaultFields(reducers));
    }
    setLoc(loc) {
      this.loc = loc;
      return this;
    }
    setEscaping(escaping) {
      this.escaping = escaping;
      return this;
    }
    setExpansion(expansion) {
      this.expansion = expansion;
      return this;
    }
    setPreviousReducer(previousReducer) {
      this.previousReducer = previousReducer;
      return this;
    }
    setCurrent(current) {
      this.current = current;
      return this;
    }
    appendEmptyExpansion() {
      this.expansion = this.expansion || [];
      this.expansion.push({
        loc: { start: Object.assign({}, this.loc.current) }
      });
      return this;
    }
    appendChar(char) {
      this.current = this.current + char;
      return this;
    }
    removeLastChar() {
      this.current = this.current.slice(0, -1);
      return this;
    }
    saveCurrentLocAsStart() {
      this.loc.start = Object.assign({}, this.loc.current);
      return this;
    }
    resetCurrent() {
      this.current = "";
      return this;
    }
    replaceLastExpansion(fields) {
      const xp = last(this.expansion);
      Object.assign(xp, fields);
      return this;
    }
    deleteLastExpansionValue() {
      const xp = last(this.expansion);
      delete xp.value;
      return this;
    }
    advanceLoc(char) {
      const loc = JSON.parse(JSON.stringify(this.loc));
      loc.previous = Object.assign({}, this.loc.current);
      if (char === `
`) {
        loc.current.row++;
        loc.current.col = 1;
      } else {
        loc.current.col++;
      }
      loc.current.char++;
      if (char && char.match(/\s/) && this.current === "") {
        loc.start = Object.assign({}, loc.current);
      }
      return this.setLoc(loc);
    }
  };
  module.exports = (options, reducers) => function* tokenizer(src) {
    reducers = reducers || require_reducers();
    const State = process.env.NODE_NEV === "development" ? mkImmutableState(reducers) : mkMutableState(reducers);
    let state = new State;
    let reduction = reducers.start;
    const source = Array.from(src);
    while (typeof reduction === "function") {
      const char = source[0];
      const r = reduction(state, source, reducers);
      const nextReduction = r.nextReduction;
      const tokensToEmit = r.tokensToEmit;
      const nextState = r.nextState;
      if (tokensToEmit) {
        yield* tokensToEmit;
      }
      if (nextState) {
        state = nextState.advanceLoc(char);
      } else {
        state = state.advanceLoc(char);
      }
      reduction = nextReduction;
    }
  };
  module.exports.reducers = require_reducers();
});

// node_modules/map-obj/index.js
var require_map_obj = __commonJS((exports, module) => {
  var isObject = (x) => typeof x === "object" && x !== null && !(x instanceof RegExp) && !(x instanceof Error) && !(x instanceof Date);
  module.exports = function mapObj(obj, fn2, opts, seen) {
    opts = Object.assign({
      deep: false,
      target: {}
    }, opts);
    seen = seen || new WeakMap;
    if (seen.has(obj)) {
      return seen.get(obj);
    }
    seen.set(obj, opts.target);
    const target = opts.target;
    delete opts.target;
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      const res = fn2(key, val, obj);
      let newVal = res[1];
      if (opts.deep && isObject(newVal)) {
        if (Array.isArray(newVal)) {
          newVal = newVal.map((x) => isObject(x) ? mapObj(x, fn2, opts, seen) : x);
        } else {
          newVal = mapObj(newVal, fn2, opts, seen);
        }
      }
      target[res[0]] = newVal;
    }
    return target;
  };
});

// node_modules/object-pairs/index.js
var require_object_pairs = __commonJS((exports, module) => {
  module.exports = function(obj) {
    return Object.keys(obj).map(function(key) {
      return [key, obj[key]];
    });
  };
});

// node_modules/vlq/dist/vlq.js
var require_vlq = __commonJS((exports, module) => {
  (function(global, factory) {
    typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : factory(global.vlq = global.vlq || {});
  })(exports, function(exports2) {
    var charToInteger = {};
    var integerToChar = {};
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".split("").forEach(function(char, i) {
      charToInteger[char] = i;
      integerToChar[i] = char;
    });
    function decode(string) {
      var result = [];
      var shift = 0;
      var value = 0;
      for (var i = 0;i < string.length; i += 1) {
        var integer = charToInteger[string[i]];
        if (integer === undefined) {
          throw new Error("Invalid character (" + string[i] + ")");
        }
        var hasContinuationBit = integer & 32;
        integer &= 31;
        value += integer << shift;
        if (hasContinuationBit) {
          shift += 5;
        } else {
          var shouldNegate = value & 1;
          value >>= 1;
          result.push(shouldNegate ? -value : value);
          value = shift = 0;
        }
      }
      return result;
    }
    function encode(value) {
      var result;
      if (typeof value === "number") {
        result = encodeInteger(value);
      } else {
        result = "";
        for (var i = 0;i < value.length; i += 1) {
          result += encodeInteger(value[i]);
        }
      }
      return result;
    }
    function encodeInteger(num) {
      var result = "";
      if (num < 0) {
        num = -num << 1 | 1;
      } else {
        num <<= 1;
      }
      do {
        var clamped = num & 31;
        num >>= 5;
        if (num > 0) {
          clamped |= 32;
        }
        result += integerToChar[clamped];
      } while (num > 0);
      return result;
    }
    exports2.decode = decode;
    exports2.encode = encode;
    Object.defineProperty(exports2, "__esModule", { value: true });
  });
});

// node_modules/magic-string/dist/magic-string.cjs.js
var require_magic_string_cjs = __commonJS((exports, module) => {
  var vlq = require_vlq();
  function Chunk(start, end, content) {
    this.start = start;
    this.end = end;
    this.original = content;
    this.intro = "";
    this.outro = "";
    this.content = content;
    this.storeName = false;
    this.edited = false;
    Object.defineProperties(this, {
      previous: { writable: true, value: null },
      next: { writable: true, value: null }
    });
  }
  Chunk.prototype = {
    append: function append(content) {
      this.outro += content;
    },
    clone: function clone() {
      var chunk = new Chunk(this.start, this.end, this.original);
      chunk.intro = this.intro;
      chunk.outro = this.outro;
      chunk.content = this.content;
      chunk.storeName = this.storeName;
      chunk.edited = this.edited;
      return chunk;
    },
    contains: function contains(index) {
      return this.start < index && index < this.end;
    },
    eachNext: function eachNext(fn2) {
      var chunk = this;
      while (chunk) {
        fn2(chunk);
        chunk = chunk.next;
      }
    },
    eachPrevious: function eachPrevious(fn2) {
      var chunk = this;
      while (chunk) {
        fn2(chunk);
        chunk = chunk.previous;
      }
    },
    edit: function edit(content, storeName) {
      this.content = content;
      this.intro = "";
      this.outro = "";
      this.storeName = storeName;
      this.edited = true;
      return this;
    },
    prepend: function prepend(content) {
      this.intro = content + this.intro;
    },
    split: function split(index) {
      var sliceIndex = index - this.start;
      var originalBefore = this.original.slice(0, sliceIndex);
      var originalAfter = this.original.slice(sliceIndex);
      this.original = originalBefore;
      var newChunk = new Chunk(index, this.end, originalAfter);
      newChunk.outro = this.outro;
      this.outro = "";
      this.end = index;
      if (this.edited) {
        newChunk.edit("", false);
        this.content = "";
      } else {
        this.content = originalBefore;
      }
      newChunk.next = this.next;
      if (newChunk.next)
        newChunk.next.previous = newChunk;
      newChunk.previous = this;
      this.next = newChunk;
      return newChunk;
    },
    toString: function toString2() {
      return this.intro + this.content + this.outro;
    },
    trimEnd: function trimEnd(rx) {
      this.outro = this.outro.replace(rx, "");
      if (this.outro.length)
        return true;
      var trimmed = this.content.replace(rx, "");
      if (trimmed.length) {
        if (trimmed !== this.content) {
          this.split(this.start + trimmed.length).edit("", false);
        }
        return true;
      } else {
        this.edit("", false);
        this.intro = this.intro.replace(rx, "");
        if (this.intro.length)
          return true;
      }
    },
    trimStart: function trimStart(rx) {
      this.intro = this.intro.replace(rx, "");
      if (this.intro.length)
        return true;
      var trimmed = this.content.replace(rx, "");
      if (trimmed.length) {
        if (trimmed !== this.content) {
          this.split(this.end - trimmed.length);
          this.edit("", false);
        }
        return true;
      } else {
        this.edit("", false);
        this.outro = this.outro.replace(rx, "");
        if (this.outro.length)
          return true;
      }
    }
  };
  var _btoa;
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    _btoa = window.btoa;
  } else if (typeof Buffer === "function") {
    _btoa = function(str) {
      return new Buffer(str).toString("base64");
    };
  } else {
    _btoa = function() {
      throw new Error("Unsupported environment: `window.btoa` or `Buffer` should be supported.");
    };
  }
  var btoa = _btoa;
  function SourceMap(properties) {
    this.version = 3;
    this.file = properties.file;
    this.sources = properties.sources;
    this.sourcesContent = properties.sourcesContent;
    this.names = properties.names;
    this.mappings = properties.mappings;
  }
  SourceMap.prototype = {
    toString: function toString2() {
      return JSON.stringify(this);
    },
    toUrl: function toUrl() {
      return "data:application/json;charset=utf-8;base64," + btoa(this.toString());
    }
  };
  function guessIndent(code) {
    var lines = code.split(`
`);
    var tabbed = lines.filter(function(line) {
      return /^\t+/.test(line);
    });
    var spaced = lines.filter(function(line) {
      return /^ {2,}/.test(line);
    });
    if (tabbed.length === 0 && spaced.length === 0) {
      return null;
    }
    if (tabbed.length >= spaced.length) {
      return "\t";
    }
    var min = spaced.reduce(function(previous, current) {
      var numSpaces = /^ +/.exec(current)[0].length;
      return Math.min(numSpaces, previous);
    }, Infinity);
    return new Array(min + 1).join(" ");
  }
  function getSemis(str) {
    return new Array(str.split(`
`).length).join(";");
  }
  function getLocator(source) {
    var originalLines = source.split(`
`);
    var start = 0;
    var lineRanges = originalLines.map(function(line, i2) {
      var end = start + line.length + 1;
      var range = { start, end, line: i2 };
      start = end;
      return range;
    });
    var i = 0;
    function rangeContains(range, index) {
      return range.start <= index && index < range.end;
    }
    function getLocation(range, index) {
      return { line: range.line, column: index - range.start };
    }
    return function locate(index) {
      var range = lineRanges[i];
      var d = index >= range.end ? 1 : -1;
      while (range) {
        if (rangeContains(range, index))
          return getLocation(range, index);
        i += d;
        range = lineRanges[i];
      }
    };
  }
  var nonWhitespace = /\S/;
  function encodeMappings(original, intro, outro, chunk, hires, sourcemapLocations, sourceIndex, offsets, names) {
    var rawLines = [];
    var generatedCodeLine = intro.split(`
`).length - 1;
    var rawSegments = rawLines[generatedCodeLine] = [];
    var generatedCodeColumn = 0;
    var locate = getLocator(original);
    function addEdit(content, original2, loc2, nameIndex, i) {
      if (i || content.length && nonWhitespace.test(content)) {
        rawSegments.push({
          generatedCodeLine,
          generatedCodeColumn,
          sourceCodeLine: loc2.line,
          sourceCodeColumn: loc2.column,
          sourceCodeName: nameIndex,
          sourceIndex
        });
      }
      var lines = content.split(`
`);
      var lastLine = lines.pop();
      if (lines.length) {
        generatedCodeLine += lines.length;
        rawLines[generatedCodeLine] = rawSegments = [];
        generatedCodeColumn = lastLine.length;
      } else {
        generatedCodeColumn += lastLine.length;
      }
      lines = original2.split(`
`);
      lastLine = lines.pop();
      if (lines.length) {
        loc2.line += lines.length;
        loc2.column = lastLine.length;
      } else {
        loc2.column += lastLine.length;
      }
    }
    function addUneditedChunk(chunk2, loc2) {
      var originalCharIndex = chunk2.start;
      var first = true;
      while (originalCharIndex < chunk2.end) {
        if (hires || first || sourcemapLocations[originalCharIndex]) {
          rawSegments.push({
            generatedCodeLine,
            generatedCodeColumn,
            sourceCodeLine: loc2.line,
            sourceCodeColumn: loc2.column,
            sourceCodeName: -1,
            sourceIndex
          });
        }
        if (original[originalCharIndex] === `
`) {
          loc2.line += 1;
          loc2.column = 0;
          generatedCodeLine += 1;
          rawLines[generatedCodeLine] = rawSegments = [];
          generatedCodeColumn = 0;
        } else {
          loc2.column += 1;
          generatedCodeColumn += 1;
        }
        originalCharIndex += 1;
        first = false;
      }
    }
    var hasContent = false;
    while (chunk) {
      var loc = locate(chunk.start);
      if (chunk.intro.length) {
        addEdit(chunk.intro, "", loc, -1, hasContent);
      }
      if (chunk.edited) {
        addEdit(chunk.content, chunk.original, loc, chunk.storeName ? names.indexOf(chunk.original) : -1, hasContent);
      } else {
        addUneditedChunk(chunk, loc);
      }
      if (chunk.outro.length) {
        addEdit(chunk.outro, "", loc, -1, hasContent);
      }
      if (chunk.content || chunk.intro || chunk.outro)
        hasContent = true;
      var nextChunk = chunk.next;
      chunk = nextChunk;
    }
    offsets.sourceIndex = offsets.sourceIndex || 0;
    offsets.sourceCodeLine = offsets.sourceCodeLine || 0;
    offsets.sourceCodeColumn = offsets.sourceCodeColumn || 0;
    offsets.sourceCodeName = offsets.sourceCodeName || 0;
    return rawLines.map(function(segments) {
      var generatedCodeColumn2 = 0;
      return segments.map(function(segment) {
        var arr = [
          segment.generatedCodeColumn - generatedCodeColumn2,
          segment.sourceIndex - offsets.sourceIndex,
          segment.sourceCodeLine - offsets.sourceCodeLine,
          segment.sourceCodeColumn - offsets.sourceCodeColumn
        ];
        generatedCodeColumn2 = segment.generatedCodeColumn;
        offsets.sourceIndex = segment.sourceIndex;
        offsets.sourceCodeLine = segment.sourceCodeLine;
        offsets.sourceCodeColumn = segment.sourceCodeColumn;
        if (~segment.sourceCodeName) {
          arr.push(segment.sourceCodeName - offsets.sourceCodeName);
          offsets.sourceCodeName = segment.sourceCodeName;
        }
        return vlq.encode(arr);
      }).join(",");
    }).join(";") + getSemis(outro);
  }
  function getRelativePath(from, to) {
    var fromParts = from.split(/[\/\\]/);
    var toParts = to.split(/[\/\\]/);
    fromParts.pop();
    while (fromParts[0] === toParts[0]) {
      fromParts.shift();
      toParts.shift();
    }
    if (fromParts.length) {
      var i = fromParts.length;
      while (i--)
        fromParts[i] = "..";
    }
    return fromParts.concat(toParts).join("/");
  }
  var toString = Object.prototype.toString;
  function isObject(thing) {
    return toString.call(thing) === "[object Object]";
  }
  function MagicString(string, options) {
    if (options === undefined)
      options = {};
    var chunk = new Chunk(0, string.length, string);
    Object.defineProperties(this, {
      original: { writable: true, value: string },
      outro: { writable: true, value: "" },
      intro: { writable: true, value: "" },
      firstChunk: { writable: true, value: chunk },
      lastChunk: { writable: true, value: chunk },
      lastSearchedChunk: { writable: true, value: chunk },
      byStart: { writable: true, value: {} },
      byEnd: { writable: true, value: {} },
      filename: { writable: true, value: options.filename },
      indentExclusionRanges: { writable: true, value: options.indentExclusionRanges },
      sourcemapLocations: { writable: true, value: {} },
      storedNames: { writable: true, value: {} },
      indentStr: { writable: true, value: guessIndent(string) }
    });
    if (false) {}
    this.byStart[0] = chunk;
    this.byEnd[string.length] = chunk;
  }
  MagicString.prototype = {
    addSourcemapLocation: function addSourcemapLocation(char) {
      this.sourcemapLocations[char] = true;
    },
    append: function append(content) {
      if (typeof content !== "string")
        throw new TypeError("outro content must be a string");
      this.outro += content;
      return this;
    },
    clone: function clone() {
      var cloned = new MagicString(this.original, { filename: this.filename });
      var originalChunk = this.firstChunk;
      var clonedChunk = cloned.firstChunk = cloned.lastSearchedChunk = originalChunk.clone();
      while (originalChunk) {
        cloned.byStart[clonedChunk.start] = clonedChunk;
        cloned.byEnd[clonedChunk.end] = clonedChunk;
        var nextOriginalChunk = originalChunk.next;
        var nextClonedChunk = nextOriginalChunk && nextOriginalChunk.clone();
        if (nextClonedChunk) {
          clonedChunk.next = nextClonedChunk;
          nextClonedChunk.previous = clonedChunk;
          clonedChunk = nextClonedChunk;
        }
        originalChunk = nextOriginalChunk;
      }
      cloned.lastChunk = clonedChunk;
      if (this.indentExclusionRanges) {
        cloned.indentExclusionRanges = typeof this.indentExclusionRanges[0] === "number" ? [this.indentExclusionRanges[0], this.indentExclusionRanges[1]] : this.indentExclusionRanges.map(function(range) {
          return [range.start, range.end];
        });
      }
      Object.keys(this.sourcemapLocations).forEach(function(loc) {
        cloned.sourcemapLocations[loc] = true;
      });
      return cloned;
    },
    generateMap: function generateMap(options) {
      options = options || {};
      var names = Object.keys(this.storedNames);
      if (false) {}
      var map = new SourceMap({
        file: options.file ? options.file.split(/[\/\\]/).pop() : null,
        sources: [options.source ? getRelativePath(options.file || "", options.source) : null],
        sourcesContent: options.includeContent ? [this.original] : [null],
        names,
        mappings: this.getMappings(options.hires, 0, {}, names)
      });
      if (false) {}
      return map;
    },
    getIndentString: function getIndentString() {
      return this.indentStr === null ? "\t" : this.indentStr;
    },
    getMappings: function getMappings(hires, sourceIndex, offsets, names) {
      return encodeMappings(this.original, this.intro, this.outro, this.firstChunk, hires, this.sourcemapLocations, sourceIndex, offsets, names);
    },
    indent: function indent(indentStr, options) {
      var this$1 = this;
      var pattern = /^[^\r\n]/gm;
      if (isObject(indentStr)) {
        options = indentStr;
        indentStr = undefined;
      }
      indentStr = indentStr !== undefined ? indentStr : this.indentStr || "\t";
      if (indentStr === "")
        return this;
      options = options || {};
      var isExcluded = {};
      if (options.exclude) {
        var exclusions = typeof options.exclude[0] === "number" ? [options.exclude] : options.exclude;
        exclusions.forEach(function(exclusion) {
          for (var i = exclusion[0];i < exclusion[1]; i += 1) {
            isExcluded[i] = true;
          }
        });
      }
      var shouldIndentNextCharacter = options.indentStart !== false;
      var replacer = function(match) {
        if (shouldIndentNextCharacter)
          return "" + indentStr + match;
        shouldIndentNextCharacter = true;
        return match;
      };
      this.intro = this.intro.replace(pattern, replacer);
      var charIndex = 0;
      var chunk = this.firstChunk;
      while (chunk) {
        var end = chunk.end;
        if (chunk.edited) {
          if (!isExcluded[charIndex]) {
            chunk.content = chunk.content.replace(pattern, replacer);
            if (chunk.content.length) {
              shouldIndentNextCharacter = chunk.content[chunk.content.length - 1] === `
`;
            }
          }
        } else {
          charIndex = chunk.start;
          while (charIndex < end) {
            if (!isExcluded[charIndex]) {
              var char = this$1.original[charIndex];
              if (char === `
`) {
                shouldIndentNextCharacter = true;
              } else if (char !== "\r" && shouldIndentNextCharacter) {
                shouldIndentNextCharacter = false;
                if (charIndex === chunk.start) {
                  chunk.prepend(indentStr);
                } else {
                  var rhs = chunk.split(charIndex);
                  rhs.prepend(indentStr);
                  this$1.byStart[charIndex] = rhs;
                  this$1.byEnd[charIndex] = chunk;
                  chunk = rhs;
                }
              }
            }
            charIndex += 1;
          }
        }
        charIndex = chunk.end;
        chunk = chunk.next;
      }
      this.outro = this.outro.replace(pattern, replacer);
      return this;
    },
    insert: function insert() {
      throw new Error("magicString.insert(...) is deprecated. Use insertRight(...) or insertLeft(...)");
    },
    insertLeft: function insertLeft(index, content) {
      if (typeof content !== "string")
        throw new TypeError("inserted content must be a string");
      if (false) {}
      this._split(index);
      var chunk = this.byEnd[index];
      if (chunk) {
        chunk.append(content);
      } else {
        this.intro += content;
      }
      if (false) {}
      return this;
    },
    insertRight: function insertRight(index, content) {
      if (typeof content !== "string")
        throw new TypeError("inserted content must be a string");
      if (false) {}
      this._split(index);
      var chunk = this.byStart[index];
      if (chunk) {
        chunk.prepend(content);
      } else {
        this.outro += content;
      }
      if (false) {}
      return this;
    },
    move: function move(start, end, index) {
      if (index >= start && index <= end)
        throw new Error("Cannot move a selection inside itself");
      if (false) {}
      this._split(start);
      this._split(end);
      this._split(index);
      var first = this.byStart[start];
      var last = this.byEnd[end];
      var oldLeft = first.previous;
      var oldRight = last.next;
      var newRight = this.byStart[index];
      if (!newRight && last === this.lastChunk)
        return this;
      var newLeft = newRight ? newRight.previous : this.lastChunk;
      if (oldLeft)
        oldLeft.next = oldRight;
      if (oldRight)
        oldRight.previous = oldLeft;
      if (newLeft)
        newLeft.next = first;
      if (newRight)
        newRight.previous = last;
      if (!first.previous)
        this.firstChunk = last.next;
      if (!last.next) {
        this.lastChunk = first.previous;
        this.lastChunk.next = null;
      }
      first.previous = newLeft;
      last.next = newRight;
      if (!newLeft)
        this.firstChunk = first;
      if (!newRight)
        this.lastChunk = last;
      if (false) {}
      return this;
    },
    overwrite: function overwrite(start, end, content, storeName) {
      var this$1 = this;
      if (typeof content !== "string")
        throw new TypeError("replacement content must be a string");
      while (start < 0)
        start += this$1.original.length;
      while (end < 0)
        end += this$1.original.length;
      if (end > this.original.length)
        throw new Error("end is out of bounds");
      if (start === end)
        throw new Error("Cannot overwrite a zero-length range \u2013 use insertLeft or insertRight instead");
      if (false) {}
      this._split(start);
      this._split(end);
      if (storeName) {
        var original = this.original.slice(start, end);
        this.storedNames[original] = true;
      }
      var first = this.byStart[start];
      var last = this.byEnd[end];
      if (first) {
        first.edit(content, storeName);
        if (first !== last) {
          var chunk = first.next;
          while (chunk !== last) {
            chunk.edit("", false);
            chunk = chunk.next;
          }
          chunk.edit("", false);
        }
      } else {
        var newChunk = new Chunk(start, end, "").edit(content, storeName);
        last.next = newChunk;
        newChunk.previous = last;
      }
      if (false) {}
      return this;
    },
    prepend: function prepend(content) {
      if (typeof content !== "string")
        throw new TypeError("outro content must be a string");
      this.intro = content + this.intro;
      return this;
    },
    remove: function remove(start, end) {
      var this$1 = this;
      while (start < 0)
        start += this$1.original.length;
      while (end < 0)
        end += this$1.original.length;
      if (start === end)
        return this;
      if (start < 0 || end > this.original.length)
        throw new Error("Character is out of bounds");
      if (start > end)
        throw new Error("end must be greater than start");
      return this.overwrite(start, end, "", false);
    },
    slice: function slice(start, end) {
      var this$1 = this;
      if (start === undefined)
        start = 0;
      if (end === undefined)
        end = this.original.length;
      while (start < 0)
        start += this$1.original.length;
      while (end < 0)
        end += this$1.original.length;
      var result = "";
      var chunk = this.firstChunk;
      while (chunk && (chunk.start > start || chunk.end <= start)) {
        if (chunk.start < end && chunk.end >= end) {
          return result;
        }
        chunk = chunk.next;
      }
      if (chunk && chunk.edited && chunk.start !== start)
        throw new Error("Cannot use replaced character " + start + " as slice start anchor.");
      var startChunk = chunk;
      while (chunk) {
        if (chunk.intro && (startChunk !== chunk || chunk.start === start)) {
          result += chunk.intro;
        }
        var containsEnd = chunk.start < end && chunk.end >= end;
        if (containsEnd && chunk.edited && chunk.end !== end)
          throw new Error("Cannot use replaced character " + end + " as slice end anchor.");
        var sliceStart = startChunk === chunk ? start - chunk.start : 0;
        var sliceEnd = containsEnd ? chunk.content.length + end - chunk.end : chunk.content.length;
        result += chunk.content.slice(sliceStart, sliceEnd);
        if (chunk.outro && (!containsEnd || chunk.end === end)) {
          result += chunk.outro;
        }
        if (containsEnd) {
          break;
        }
        chunk = chunk.next;
      }
      return result;
    },
    snip: function snip(start, end) {
      var clone = this.clone();
      clone.remove(0, start);
      clone.remove(end, clone.original.length);
      return clone;
    },
    _split: function _split(index) {
      var this$1 = this;
      if (this.byStart[index] || this.byEnd[index])
        return;
      if (false) {}
      var chunk = this.lastSearchedChunk;
      var searchForward = index > chunk.end;
      while (true) {
        if (chunk.contains(index))
          return this$1._splitChunk(chunk, index);
        chunk = searchForward ? this$1.byStart[chunk.end] : this$1.byEnd[chunk.start];
      }
    },
    _splitChunk: function _splitChunk(chunk, index) {
      if (chunk.edited && chunk.content.length) {
        var loc = getLocator(this.original)(index);
        throw new Error("Cannot split a chunk that has already been edited (" + loc.line + ":" + loc.column + ' \u2013 "' + chunk.original + '")');
      }
      var newChunk = chunk.split(index);
      this.byEnd[index] = chunk;
      this.byStart[index] = newChunk;
      this.byEnd[newChunk.end] = newChunk;
      if (chunk === this.lastChunk)
        this.lastChunk = newChunk;
      this.lastSearchedChunk = chunk;
      if (false) {}
      return true;
    },
    toString: function toString2() {
      var str = this.intro;
      var chunk = this.firstChunk;
      while (chunk) {
        str += chunk.toString();
        chunk = chunk.next;
      }
      return str + this.outro;
    },
    trimLines: function trimLines() {
      return this.trim("[\\r\\n]");
    },
    trim: function trim(charType) {
      return this.trimStart(charType).trimEnd(charType);
    },
    trimEnd: function trimEnd(charType) {
      var this$1 = this;
      var rx = new RegExp((charType || "\\s") + "+$");
      this.outro = this.outro.replace(rx, "");
      if (this.outro.length)
        return this;
      var chunk = this.lastChunk;
      do {
        var end = chunk.end;
        var aborted = chunk.trimEnd(rx);
        if (chunk.end !== end) {
          this$1.lastChunk = chunk.next;
          this$1.byEnd[chunk.end] = chunk;
          this$1.byStart[chunk.next.start] = chunk.next;
        }
        if (aborted)
          return this$1;
        chunk = chunk.previous;
      } while (chunk);
      return this;
    },
    trimStart: function trimStart(charType) {
      var this$1 = this;
      var rx = new RegExp("^" + (charType || "\\s") + "+");
      this.intro = this.intro.replace(rx, "");
      if (this.intro.length)
        return this;
      var chunk = this.firstChunk;
      do {
        var end = chunk.end;
        var aborted = chunk.trimStart(rx);
        if (chunk.end !== end) {
          if (chunk === this$1.lastChunk)
            this$1.lastChunk = chunk.next;
          this$1.byEnd[chunk.end] = chunk;
          this$1.byStart[chunk.next.start] = chunk.next;
        }
        if (aborted)
          return this$1;
        chunk = chunk.next;
      } while (chunk);
      return this;
    }
  };
  var hasOwnProp = Object.prototype.hasOwnProperty;
  function Bundle(options) {
    if (options === undefined)
      options = {};
    this.intro = options.intro || "";
    this.separator = options.separator !== undefined ? options.separator : `
`;
    this.sources = [];
    this.uniqueSources = [];
    this.uniqueSourceIndexByFilename = {};
  }
  Bundle.prototype = {
    addSource: function addSource(source) {
      if (source instanceof MagicString) {
        return this.addSource({
          content: source,
          filename: source.filename,
          separator: this.separator
        });
      }
      if (!isObject(source) || !source.content) {
        throw new Error("bundle.addSource() takes an object with a `content` property, which should be an instance of MagicString, and an optional `filename`");
      }
      ["filename", "indentExclusionRanges", "separator"].forEach(function(option) {
        if (!hasOwnProp.call(source, option))
          source[option] = source.content[option];
      });
      if (source.separator === undefined) {
        source.separator = this.separator;
      }
      if (source.filename) {
        if (!hasOwnProp.call(this.uniqueSourceIndexByFilename, source.filename)) {
          this.uniqueSourceIndexByFilename[source.filename] = this.uniqueSources.length;
          this.uniqueSources.push({ filename: source.filename, content: source.content.original });
        } else {
          var uniqueSource = this.uniqueSources[this.uniqueSourceIndexByFilename[source.filename]];
          if (source.content.original !== uniqueSource.content) {
            throw new Error("Illegal source: same filename (" + source.filename + "), different contents");
          }
        }
      }
      this.sources.push(source);
      return this;
    },
    append: function append(str, options) {
      this.addSource({
        content: new MagicString(str),
        separator: options && options.separator || ""
      });
      return this;
    },
    clone: function clone() {
      var bundle = new Bundle({
        intro: this.intro,
        separator: this.separator
      });
      this.sources.forEach(function(source) {
        bundle.addSource({
          filename: source.filename,
          content: source.content.clone(),
          separator: source.separator
        });
      });
      return bundle;
    },
    generateMap: function generateMap(options) {
      var this$1 = this;
      options = options || {};
      var offsets = {};
      var names = [];
      this.sources.forEach(function(source) {
        Object.keys(source.content.storedNames).forEach(function(name) {
          if (!~names.indexOf(name))
            names.push(name);
        });
      });
      var encoded = getSemis(this.intro) + this.sources.map(function(source, i) {
        var prefix = i > 0 ? getSemis(source.separator) || "," : "";
        var mappings;
        if (!source.filename) {
          mappings = getSemis(source.content.toString());
        } else {
          var sourceIndex = this$1.uniqueSourceIndexByFilename[source.filename];
          mappings = source.content.getMappings(options.hires, sourceIndex, offsets, names);
        }
        return prefix + mappings;
      }).join("");
      return new SourceMap({
        file: options.file ? options.file.split(/[\/\\]/).pop() : null,
        sources: this.uniqueSources.map(function(source) {
          return options.file ? getRelativePath(options.file, source.filename) : source.filename;
        }),
        sourcesContent: this.uniqueSources.map(function(source) {
          return options.includeContent ? source.content : null;
        }),
        names,
        mappings: encoded
      });
    },
    getIndentString: function getIndentString() {
      var indentStringCounts = {};
      this.sources.forEach(function(source) {
        var indentStr = source.content.indentStr;
        if (indentStr === null)
          return;
        if (!indentStringCounts[indentStr])
          indentStringCounts[indentStr] = 0;
        indentStringCounts[indentStr] += 1;
      });
      return Object.keys(indentStringCounts).sort(function(a, b) {
        return indentStringCounts[a] - indentStringCounts[b];
      })[0] || "\t";
    },
    indent: function indent(indentStr) {
      var this$1 = this;
      if (!arguments.length) {
        indentStr = this.getIndentString();
      }
      if (indentStr === "")
        return this;
      var trailingNewline = !this.intro || this.intro.slice(-1) === `
`;
      this.sources.forEach(function(source, i) {
        var separator = source.separator !== undefined ? source.separator : this$1.separator;
        var indentStart = trailingNewline || i > 0 && /\r?\n$/.test(separator);
        source.content.indent(indentStr, {
          exclude: source.indentExclusionRanges,
          indentStart
        });
        trailingNewline = source.content.toString().slice(0, -1) === `
`;
      });
      if (this.intro) {
        this.intro = indentStr + this.intro.replace(/^[^\n]/gm, function(match, index) {
          return index > 0 ? indentStr + match : match;
        });
      }
      return this;
    },
    prepend: function prepend(str) {
      this.intro = str + this.intro;
      return this;
    },
    toString: function toString2() {
      var this$1 = this;
      var body = this.sources.map(function(source, i) {
        var separator = source.separator !== undefined ? source.separator : this$1.separator;
        var str = (i > 0 ? separator : "") + source.content.toString();
        return str;
      }).join("");
      return this.intro + body;
    },
    trimLines: function trimLines() {
      return this.trim("[\\r\\n]");
    },
    trim: function trim(charType) {
      return this.trimStart(charType).trimEnd(charType);
    },
    trimStart: function trimStart(charType) {
      var this$1 = this;
      var rx = new RegExp("^" + (charType || "\\s") + "+");
      this.intro = this.intro.replace(rx, "");
      if (!this.intro) {
        var source;
        var i = 0;
        do {
          source = this$1.sources[i];
          if (!source) {
            break;
          }
          source.content.trimStart(charType);
          i += 1;
        } while (source.content.toString() === "");
      }
      return this;
    },
    trimEnd: function trimEnd(charType) {
      var this$1 = this;
      var rx = new RegExp((charType || "\\s") + "+$");
      var source;
      var i = this.sources.length - 1;
      do {
        source = this$1.sources[i];
        if (!source) {
          this$1.intro = this$1.intro.replace(rx, "");
          break;
        }
        source.content.trimEnd(charType);
        i -= 1;
      } while (source.content.toString() === "");
      return this;
    }
  };
  MagicString.Bundle = Bundle;
  module.exports = MagicString;
});

// node_modules/bash-parser/src/modes/posix/rules/field-splitting.js
var require_field_splitting = __commonJS((exports) => {
  var map = require_map_iterable();
  var merge = require_transform_spread_iterable();
  var compose = require_compose_function();
  var mkFieldSplitToken = require_tokens().mkFieldSplitToken;
  exports.mark = function markFieldSplitting(result, text, options) {
    if (typeof options.resolveEnv === "function" && text[0] !== "'" && text[0] !== '"') {
      const ifs = options.resolveEnv("IFS");
      if (ifs !== null) {
        return result.replace(new RegExp(`[${ifs}]+`, "g"), "\x00");
      }
    }
    return result;
  };
  exports.split = () => compose(merge, map((token) => {
    if (token.is("WORD")) {
      const fields = token.value.split("\x00");
      if (fields.length > 1) {
        let idx = 0;
        return fields.map((field) => mkFieldSplitToken(token, field, idx++));
      }
    }
    return token;
  }));
});

// node_modules/bash-parser/src/modes/posix/rules/parameter-expansion.js
var require_parameter_expansion = __commonJS((exports, module) => {
  var mapObj = require_map_obj();
  var filter = require_filter_obj();
  var map = require_map_iterable();
  var pairs = require_object_pairs();
  var MagicString = require_magic_string_cjs();
  var tokens = require_tokens();
  var fieldSplitting = require_field_splitting();
  var handleParameter = (obj, match) => {
    const ret = mapObj(obj, (k, v) => {
      if (typeof v === "function") {
        const val = v(match);
        return [k, val];
      }
      if (typeof v === "object" && k !== "expand") {
        return [k, handleParameter(v, match)];
      }
      return [k, v];
    });
    if (ret.expand) {
      const bashParser = require_src();
      for (const prop of ret.expand) {
        const ast = bashParser(ret[prop], { mode: "word-expansion" });
        ret[prop] = ast.commands[0].name;
      }
      delete ret.expand;
    }
    return ret;
  };
  function expandParameter(xp, enums) {
    let parameter = xp.parameter;
    for (const pair of pairs(enums.parameterOperators)) {
      const re = new RegExp(pair[0]);
      const match = parameter.match(re);
      if (match) {
        const opProps = handleParameter(pair[1], match);
        return filter(Object.assign(xp, opProps), (k, v) => v !== undefined);
      }
    }
    return xp;
  }
  var parameterExpansion = (options, mode) => map((token) => {
    if (token.is("WORD") || token.is("ASSIGNMENT_WORD")) {
      if (!token.expansion || token.expansion.length === 0) {
        return token;
      }
      return tokens.setExpansions(token, token.expansion.map((xp) => {
        if (xp.type === "parameter_expansion") {
          return expandParameter(xp, mode.enums);
        }
        return xp;
      }));
    }
    return token;
  });
  parameterExpansion.resolve = (options) => map((token) => {
    if (token.is("WORD") || token.is("ASSIGNMENT_WORD")) {
      if (!options.resolveParameter || !token.expansion || token.expansion.length === 0) {
        return token;
      }
      const value = token.value;
      const magic = new MagicString(value);
      for (const xp of token.expansion) {
        if (xp.type === "parameter_expansion") {
          const result = options.resolveParameter(xp);
          xp.resolved = true;
          magic.overwrite(xp.loc.start, xp.loc.end + 1, fieldSplitting.mark(result, value, options));
        }
      }
      return tokens.alterValue(token, magic.toString());
    }
    return token;
  });
  module.exports = parameterExpansion;
});

// node_modules/bash-parser/src/modes/posix/rules/command-expansion.js
var require_command_expansion = __commonJS((exports, module) => {
  var map = require_map_iterable();
  var MagicString = require_magic_string_cjs();
  var tokensUtils = require_tokens();
  var fieldSplitting = require_field_splitting();
  function setCommandExpansion(xp, token) {
    let command = xp.command;
    if (token.value[xp.loc.start - 1] === "`") {
      command = command.replace(/\\`/g, "`");
    }
    const bashParser = require_src();
    const commandAST = bashParser(command);
    return Object.assign({}, xp, { command, commandAST });
  }
  var commandExpansion = () => map((token) => {
    if (token.is("WORD") || token.is("ASSIGNMENT_WORD")) {
      if (!token.expansion || token.expansion.length === 0) {
        return token;
      }
      return tokensUtils.setExpansions(token, token.expansion.map((xp) => {
        if (xp.type === "command_expansion") {
          return setCommandExpansion(xp, token);
        }
        return xp;
      }));
    }
    return token;
  });
  commandExpansion.resolve = (options) => map((token) => {
    if (options.execCommand && token.expansion) {
      const value = token.value;
      const magic = new MagicString(value);
      for (const xp of token.expansion) {
        if (xp.type === "command_expansion") {
          const result = options.execCommand(xp);
          magic.overwrite(xp.loc.start, xp.loc.end + 1, fieldSplitting.mark(result.replace(/\n+$/, ""), value, options));
          xp.resolved = true;
        }
      }
      return token.alterValue(magic.toString());
    }
    return token;
  });
  module.exports = commandExpansion;
});

// node_modules/babylon/lib/index.js
var require_lib = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  function makePredicate(words) {
    words = words.split(" ");
    return function(str) {
      return words.indexOf(str) >= 0;
    };
  }
  var reservedWords = {
    6: makePredicate("enum await"),
    strict: makePredicate("implements interface let package private protected public static yield"),
    strictBind: makePredicate("eval arguments")
  };
  var isKeyword = makePredicate("break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this let const class extends export import yield super");
  var nonASCIIidentifierStartChars = "\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC";
  var nonASCIIidentifierChars = "\u200C\u200D\xB7\u0300-\u036F\u0387\u0483-\u0487\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u0669\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u06F0-\u06F9\u0711\u0730-\u074A\u07A6-\u07B0\u07C0-\u07C9\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D4-\u08E1\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0966-\u096F\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u09E6-\u09EF\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A66-\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B66-\u0B6F\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0CE6-\u0CEF\u0D01-\u0D03\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D66-\u0D6F\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0E50-\u0E59\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0ED0-\u0ED9\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1040-\u1049\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109D\u135D-\u135F\u1369-\u1371\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u18A9\u1920-\u192B\u1930-\u193B\u1946-\u194F\u19D0-\u19DA\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AB0-\u1ABD\u1B00-\u1B04\u1B34-\u1B44\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BF3\u1C24-\u1C37\u1C40-\u1C49\u1C50-\u1C59\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF5\u1DFB-\u1DFF\u203F\u2040\u2054\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA620-\uA629\uA66F\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F1\uA900-\uA909\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9D0-\uA9D9\uA9E5\uA9F0-\uA9F9\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA50-\uAA59\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uABF0-\uABF9\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFF10-\uFF19\uFF3F";
  var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
  var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");
  nonASCIIidentifierStartChars = nonASCIIidentifierChars = null;
  var astralIdentifierStartCodes = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 17, 26, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 19, 35, 5, 35, 5, 39, 9, 51, 157, 310, 10, 21, 11, 7, 153, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 66, 18, 2, 1, 11, 21, 11, 25, 71, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 26, 45, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 56, 50, 14, 50, 785, 52, 76, 44, 33, 24, 27, 35, 42, 34, 4, 0, 13, 47, 15, 3, 22, 0, 2, 0, 36, 17, 2, 24, 85, 6, 2, 0, 2, 3, 2, 14, 2, 9, 8, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 19, 0, 13, 4, 159, 52, 19, 3, 54, 47, 21, 1, 2, 0, 185, 46, 42, 3, 37, 47, 21, 0, 60, 42, 86, 25, 391, 63, 32, 0, 449, 56, 264, 8, 2, 36, 18, 0, 50, 29, 881, 921, 103, 110, 18, 195, 2749, 1070, 4050, 582, 8634, 568, 8, 30, 114, 29, 19, 47, 17, 3, 32, 20, 6, 18, 881, 68, 12, 0, 67, 12, 65, 0, 32, 6124, 20, 754, 9486, 1, 3071, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 4149, 196, 60, 67, 1213, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42710, 42, 4148, 12, 221, 3, 5761, 10591, 541];
  var astralIdentifierCodes = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 1306, 2, 54, 14, 32, 9, 16, 3, 46, 10, 54, 9, 7, 2, 37, 13, 2, 9, 52, 0, 13, 2, 49, 13, 10, 2, 4, 9, 83, 11, 7, 0, 161, 11, 6, 9, 7, 3, 57, 0, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 193, 17, 10, 9, 87, 19, 13, 9, 214, 6, 3, 8, 28, 1, 83, 16, 16, 9, 82, 12, 9, 9, 84, 14, 5, 9, 423, 9, 838, 7, 2, 7, 17, 9, 57, 21, 2, 13, 19882, 9, 135, 4, 60, 6, 26, 9, 1016, 45, 17, 3, 19723, 1, 5319, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 513, 54, 5, 49, 9, 0, 15, 0, 23, 4, 2, 14, 1361, 6, 2, 16, 3, 6, 2, 1, 2, 4, 2214, 6, 110, 6, 6, 9, 792487, 239];
  function isInAstralSet(code, set) {
    var pos = 65536;
    for (var i = 0;i < set.length; i += 2) {
      pos += set[i];
      if (pos > code)
        return false;
      pos += set[i + 1];
      if (pos >= code)
        return true;
    }
  }
  function isIdentifierStart(code) {
    if (code < 65)
      return code === 36;
    if (code < 91)
      return true;
    if (code < 97)
      return code === 95;
    if (code < 123)
      return true;
    if (code <= 65535)
      return code >= 170 && nonASCIIidentifierStart.test(String.fromCharCode(code));
    return isInAstralSet(code, astralIdentifierStartCodes);
  }
  function isIdentifierChar(code) {
    if (code < 48)
      return code === 36;
    if (code < 58)
      return true;
    if (code < 65)
      return false;
    if (code < 91)
      return true;
    if (code < 97)
      return code === 95;
    if (code < 123)
      return true;
    if (code <= 65535)
      return code >= 170 && nonASCIIidentifier.test(String.fromCharCode(code));
    return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes);
  }
  var defaultOptions = {
    sourceType: "script",
    sourceFilename: undefined,
    startLine: 1,
    allowReturnOutsideFunction: false,
    allowImportExportEverywhere: false,
    allowSuperOutsideMethod: false,
    plugins: [],
    strictMode: null
  };
  function getOptions(opts) {
    var options = {};
    for (var key in defaultOptions) {
      options[key] = opts && key in opts ? opts[key] : defaultOptions[key];
    }
    return options;
  }
  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
    return typeof obj;
  } : function(obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };
  var classCallCheck = function(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };
  var inherits = function(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass)
      Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };
  var possibleConstructorReturn = function(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };
  var beforeExpr = true;
  var startsExpr = true;
  var isLoop = true;
  var isAssign = true;
  var prefix = true;
  var postfix = true;
  var TokenType = function TokenType2(label) {
    var conf = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    classCallCheck(this, TokenType2);
    this.label = label;
    this.keyword = conf.keyword;
    this.beforeExpr = !!conf.beforeExpr;
    this.startsExpr = !!conf.startsExpr;
    this.rightAssociative = !!conf.rightAssociative;
    this.isLoop = !!conf.isLoop;
    this.isAssign = !!conf.isAssign;
    this.prefix = !!conf.prefix;
    this.postfix = !!conf.postfix;
    this.binop = conf.binop || null;
    this.updateContext = null;
  };
  var KeywordTokenType = function(_TokenType) {
    inherits(KeywordTokenType2, _TokenType);
    function KeywordTokenType2(name) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      classCallCheck(this, KeywordTokenType2);
      options.keyword = name;
      return possibleConstructorReturn(this, _TokenType.call(this, name, options));
    }
    return KeywordTokenType2;
  }(TokenType);
  var BinopTokenType = function(_TokenType2) {
    inherits(BinopTokenType2, _TokenType2);
    function BinopTokenType2(name, prec) {
      classCallCheck(this, BinopTokenType2);
      return possibleConstructorReturn(this, _TokenType2.call(this, name, { beforeExpr, binop: prec }));
    }
    return BinopTokenType2;
  }(TokenType);
  var types2 = {
    num: new TokenType("num", { startsExpr }),
    regexp: new TokenType("regexp", { startsExpr }),
    string: new TokenType("string", { startsExpr }),
    name: new TokenType("name", { startsExpr }),
    eof: new TokenType("eof"),
    bracketL: new TokenType("[", { beforeExpr, startsExpr }),
    bracketR: new TokenType("]"),
    braceL: new TokenType("{", { beforeExpr, startsExpr }),
    braceBarL: new TokenType("{|", { beforeExpr, startsExpr }),
    braceR: new TokenType("}"),
    braceBarR: new TokenType("|}"),
    parenL: new TokenType("(", { beforeExpr, startsExpr }),
    parenR: new TokenType(")"),
    comma: new TokenType(",", { beforeExpr }),
    semi: new TokenType(";", { beforeExpr }),
    colon: new TokenType(":", { beforeExpr }),
    doubleColon: new TokenType("::", { beforeExpr }),
    dot: new TokenType("."),
    question: new TokenType("?", { beforeExpr }),
    arrow: new TokenType("=>", { beforeExpr }),
    template: new TokenType("template"),
    ellipsis: new TokenType("...", { beforeExpr }),
    backQuote: new TokenType("`", { startsExpr }),
    dollarBraceL: new TokenType("${", { beforeExpr, startsExpr }),
    at: new TokenType("@"),
    eq: new TokenType("=", { beforeExpr, isAssign }),
    assign: new TokenType("_=", { beforeExpr, isAssign }),
    incDec: new TokenType("++/--", { prefix, postfix, startsExpr }),
    prefix: new TokenType("prefix", { beforeExpr, prefix, startsExpr }),
    logicalOR: new BinopTokenType("||", 1),
    logicalAND: new BinopTokenType("&&", 2),
    bitwiseOR: new BinopTokenType("|", 3),
    bitwiseXOR: new BinopTokenType("^", 4),
    bitwiseAND: new BinopTokenType("&", 5),
    equality: new BinopTokenType("==/!=", 6),
    relational: new BinopTokenType("</>", 7),
    bitShift: new BinopTokenType("<</>>", 8),
    plusMin: new TokenType("+/-", { beforeExpr, binop: 9, prefix, startsExpr }),
    modulo: new BinopTokenType("%", 10),
    star: new BinopTokenType("*", 10),
    slash: new BinopTokenType("/", 10),
    exponent: new TokenType("**", { beforeExpr, binop: 11, rightAssociative: true })
  };
  var keywords = {
    break: new KeywordTokenType("break"),
    case: new KeywordTokenType("case", { beforeExpr }),
    catch: new KeywordTokenType("catch"),
    continue: new KeywordTokenType("continue"),
    debugger: new KeywordTokenType("debugger"),
    default: new KeywordTokenType("default", { beforeExpr }),
    do: new KeywordTokenType("do", { isLoop, beforeExpr }),
    else: new KeywordTokenType("else", { beforeExpr }),
    finally: new KeywordTokenType("finally"),
    for: new KeywordTokenType("for", { isLoop }),
    function: new KeywordTokenType("function", { startsExpr }),
    if: new KeywordTokenType("if"),
    return: new KeywordTokenType("return", { beforeExpr }),
    switch: new KeywordTokenType("switch"),
    throw: new KeywordTokenType("throw", { beforeExpr }),
    try: new KeywordTokenType("try"),
    var: new KeywordTokenType("var"),
    let: new KeywordTokenType("let"),
    const: new KeywordTokenType("const"),
    while: new KeywordTokenType("while", { isLoop }),
    with: new KeywordTokenType("with"),
    new: new KeywordTokenType("new", { beforeExpr, startsExpr }),
    this: new KeywordTokenType("this", { startsExpr }),
    super: new KeywordTokenType("super", { startsExpr }),
    class: new KeywordTokenType("class"),
    extends: new KeywordTokenType("extends", { beforeExpr }),
    export: new KeywordTokenType("export"),
    import: new KeywordTokenType("import", { startsExpr }),
    yield: new KeywordTokenType("yield", { beforeExpr, startsExpr }),
    null: new KeywordTokenType("null", { startsExpr }),
    true: new KeywordTokenType("true", { startsExpr }),
    false: new KeywordTokenType("false", { startsExpr }),
    in: new KeywordTokenType("in", { beforeExpr, binop: 7 }),
    instanceof: new KeywordTokenType("instanceof", { beforeExpr, binop: 7 }),
    typeof: new KeywordTokenType("typeof", { beforeExpr, prefix, startsExpr }),
    void: new KeywordTokenType("void", { beforeExpr, prefix, startsExpr }),
    delete: new KeywordTokenType("delete", { beforeExpr, prefix, startsExpr })
  };
  Object.keys(keywords).forEach(function(name) {
    types2["_" + name] = keywords[name];
  });
  var lineBreak = /\r\n?|\n|\u2028|\u2029/;
  var lineBreakG = new RegExp(lineBreak.source, "g");
  function isNewLine(code) {
    return code === 10 || code === 13 || code === 8232 || code === 8233;
  }
  var nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/;
  var TokContext = function TokContext2(token, isExpr, preserveSpace, override) {
    classCallCheck(this, TokContext2);
    this.token = token;
    this.isExpr = !!isExpr;
    this.preserveSpace = !!preserveSpace;
    this.override = override;
  };
  var types$1 = {
    braceStatement: new TokContext("{", false),
    braceExpression: new TokContext("{", true),
    templateQuasi: new TokContext("${", true),
    parenStatement: new TokContext("(", false),
    parenExpression: new TokContext("(", true),
    template: new TokContext("`", true, true, function(p) {
      return p.readTmplToken();
    }),
    functionExpression: new TokContext("function", true)
  };
  types2.parenR.updateContext = types2.braceR.updateContext = function() {
    if (this.state.context.length === 1) {
      this.state.exprAllowed = true;
      return;
    }
    var out = this.state.context.pop();
    if (out === types$1.braceStatement && this.curContext() === types$1.functionExpression) {
      this.state.context.pop();
      this.state.exprAllowed = false;
    } else if (out === types$1.templateQuasi) {
      this.state.exprAllowed = true;
    } else {
      this.state.exprAllowed = !out.isExpr;
    }
  };
  types2.name.updateContext = function(prevType) {
    this.state.exprAllowed = false;
    if (prevType === types2._let || prevType === types2._const || prevType === types2._var) {
      if (lineBreak.test(this.input.slice(this.state.end))) {
        this.state.exprAllowed = true;
      }
    }
  };
  types2.braceL.updateContext = function(prevType) {
    this.state.context.push(this.braceIsBlock(prevType) ? types$1.braceStatement : types$1.braceExpression);
    this.state.exprAllowed = true;
  };
  types2.dollarBraceL.updateContext = function() {
    this.state.context.push(types$1.templateQuasi);
    this.state.exprAllowed = true;
  };
  types2.parenL.updateContext = function(prevType) {
    var statementParens = prevType === types2._if || prevType === types2._for || prevType === types2._with || prevType === types2._while;
    this.state.context.push(statementParens ? types$1.parenStatement : types$1.parenExpression);
    this.state.exprAllowed = true;
  };
  types2.incDec.updateContext = function() {};
  types2._function.updateContext = function() {
    if (this.curContext() !== types$1.braceStatement) {
      this.state.context.push(types$1.functionExpression);
    }
    this.state.exprAllowed = false;
  };
  types2.backQuote.updateContext = function() {
    if (this.curContext() === types$1.template) {
      this.state.context.pop();
    } else {
      this.state.context.push(types$1.template);
    }
    this.state.exprAllowed = false;
  };
  var Position = function Position2(line, col) {
    classCallCheck(this, Position2);
    this.line = line;
    this.column = col;
  };
  var SourceLocation = function SourceLocation2(start, end) {
    classCallCheck(this, SourceLocation2);
    this.start = start;
    this.end = end;
  };
  function getLineInfo(input, offset) {
    for (var line = 1, cur = 0;; ) {
      lineBreakG.lastIndex = cur;
      var match = lineBreakG.exec(input);
      if (match && match.index < offset) {
        ++line;
        cur = match.index + match[0].length;
      } else {
        return new Position(line, offset - cur);
      }
    }
  }
  var State = function() {
    function State2() {
      classCallCheck(this, State2);
    }
    State2.prototype.init = function init(options, input) {
      this.strict = options.strictMode === false ? false : options.sourceType === "module";
      this.input = input;
      this.potentialArrowAt = -1;
      this.inMethod = this.inFunction = this.inGenerator = this.inAsync = this.inPropertyName = this.inType = this.inClassProperty = this.noAnonFunctionType = false;
      this.labels = [];
      this.decorators = [];
      this.tokens = [];
      this.comments = [];
      this.trailingComments = [];
      this.leadingComments = [];
      this.commentStack = [];
      this.pos = this.lineStart = 0;
      this.curLine = options.startLine;
      this.type = types2.eof;
      this.value = null;
      this.start = this.end = this.pos;
      this.startLoc = this.endLoc = this.curPosition();
      this.lastTokEndLoc = this.lastTokStartLoc = null;
      this.lastTokStart = this.lastTokEnd = this.pos;
      this.context = [types$1.braceStatement];
      this.exprAllowed = true;
      this.containsEsc = this.containsOctal = false;
      this.octalPosition = null;
      this.invalidTemplateEscapePosition = null;
      this.exportedIdentifiers = [];
      return this;
    };
    State2.prototype.curPosition = function curPosition() {
      return new Position(this.curLine, this.pos - this.lineStart);
    };
    State2.prototype.clone = function clone(skipArrays) {
      var state = new State2;
      for (var key in this) {
        var val = this[key];
        if ((!skipArrays || key === "context") && Array.isArray(val)) {
          val = val.slice();
        }
        state[key] = val;
      }
      return state;
    };
    return State2;
  }();
  var Token = function Token2(state) {
    classCallCheck(this, Token2);
    this.type = state.type;
    this.value = state.value;
    this.start = state.start;
    this.end = state.end;
    this.loc = new SourceLocation(state.startLoc, state.endLoc);
  };
  function codePointToString(code) {
    if (code <= 65535) {
      return String.fromCharCode(code);
    } else {
      return String.fromCharCode((code - 65536 >> 10) + 55296, (code - 65536 & 1023) + 56320);
    }
  }
  var Tokenizer = function() {
    function Tokenizer2(options, input) {
      classCallCheck(this, Tokenizer2);
      this.state = new State;
      this.state.init(options, input);
    }
    Tokenizer2.prototype.next = function next() {
      if (!this.isLookahead) {
        this.state.tokens.push(new Token(this.state));
      }
      this.state.lastTokEnd = this.state.end;
      this.state.lastTokStart = this.state.start;
      this.state.lastTokEndLoc = this.state.endLoc;
      this.state.lastTokStartLoc = this.state.startLoc;
      this.nextToken();
    };
    Tokenizer2.prototype.eat = function eat(type) {
      if (this.match(type)) {
        this.next();
        return true;
      } else {
        return false;
      }
    };
    Tokenizer2.prototype.match = function match(type) {
      return this.state.type === type;
    };
    Tokenizer2.prototype.isKeyword = function isKeyword$$1(word) {
      return isKeyword(word);
    };
    Tokenizer2.prototype.lookahead = function lookahead() {
      var old = this.state;
      this.state = old.clone(true);
      this.isLookahead = true;
      this.next();
      this.isLookahead = false;
      var curr = this.state.clone(true);
      this.state = old;
      return curr;
    };
    Tokenizer2.prototype.setStrict = function setStrict(strict) {
      this.state.strict = strict;
      if (!this.match(types2.num) && !this.match(types2.string))
        return;
      this.state.pos = this.state.start;
      while (this.state.pos < this.state.lineStart) {
        this.state.lineStart = this.input.lastIndexOf(`
`, this.state.lineStart - 2) + 1;
        --this.state.curLine;
      }
      this.nextToken();
    };
    Tokenizer2.prototype.curContext = function curContext() {
      return this.state.context[this.state.context.length - 1];
    };
    Tokenizer2.prototype.nextToken = function nextToken() {
      var curContext = this.curContext();
      if (!curContext || !curContext.preserveSpace)
        this.skipSpace();
      this.state.containsOctal = false;
      this.state.octalPosition = null;
      this.state.start = this.state.pos;
      this.state.startLoc = this.state.curPosition();
      if (this.state.pos >= this.input.length)
        return this.finishToken(types2.eof);
      if (curContext.override) {
        return curContext.override(this);
      } else {
        return this.readToken(this.fullCharCodeAtPos());
      }
    };
    Tokenizer2.prototype.readToken = function readToken(code) {
      if (isIdentifierStart(code) || code === 92) {
        return this.readWord();
      } else {
        return this.getTokenFromCode(code);
      }
    };
    Tokenizer2.prototype.fullCharCodeAtPos = function fullCharCodeAtPos() {
      var code = this.input.charCodeAt(this.state.pos);
      if (code <= 55295 || code >= 57344)
        return code;
      var next = this.input.charCodeAt(this.state.pos + 1);
      return (code << 10) + next - 56613888;
    };
    Tokenizer2.prototype.pushComment = function pushComment(block, text, start, end, startLoc, endLoc) {
      var comment = {
        type: block ? "CommentBlock" : "CommentLine",
        value: text,
        start,
        end,
        loc: new SourceLocation(startLoc, endLoc)
      };
      if (!this.isLookahead) {
        this.state.tokens.push(comment);
        this.state.comments.push(comment);
        this.addComment(comment);
      }
    };
    Tokenizer2.prototype.skipBlockComment = function skipBlockComment() {
      var startLoc = this.state.curPosition();
      var start = this.state.pos;
      var end = this.input.indexOf("*/", this.state.pos += 2);
      if (end === -1)
        this.raise(this.state.pos - 2, "Unterminated comment");
      this.state.pos = end + 2;
      lineBreakG.lastIndex = start;
      var match = undefined;
      while ((match = lineBreakG.exec(this.input)) && match.index < this.state.pos) {
        ++this.state.curLine;
        this.state.lineStart = match.index + match[0].length;
      }
      this.pushComment(true, this.input.slice(start + 2, end), start, this.state.pos, startLoc, this.state.curPosition());
    };
    Tokenizer2.prototype.skipLineComment = function skipLineComment(startSkip) {
      var start = this.state.pos;
      var startLoc = this.state.curPosition();
      var ch = this.input.charCodeAt(this.state.pos += startSkip);
      while (this.state.pos < this.input.length && ch !== 10 && ch !== 13 && ch !== 8232 && ch !== 8233) {
        ++this.state.pos;
        ch = this.input.charCodeAt(this.state.pos);
      }
      this.pushComment(false, this.input.slice(start + startSkip, this.state.pos), start, this.state.pos, startLoc, this.state.curPosition());
    };
    Tokenizer2.prototype.skipSpace = function skipSpace() {
      loop:
        while (this.state.pos < this.input.length) {
          var ch = this.input.charCodeAt(this.state.pos);
          switch (ch) {
            case 32:
            case 160:
              ++this.state.pos;
              break;
            case 13:
              if (this.input.charCodeAt(this.state.pos + 1) === 10) {
                ++this.state.pos;
              }
            case 10:
            case 8232:
            case 8233:
              ++this.state.pos;
              ++this.state.curLine;
              this.state.lineStart = this.state.pos;
              break;
            case 47:
              switch (this.input.charCodeAt(this.state.pos + 1)) {
                case 42:
                  this.skipBlockComment();
                  break;
                case 47:
                  this.skipLineComment(2);
                  break;
                default:
                  break loop;
              }
              break;
            default:
              if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
                ++this.state.pos;
              } else {
                break loop;
              }
          }
        }
    };
    Tokenizer2.prototype.finishToken = function finishToken(type, val) {
      this.state.end = this.state.pos;
      this.state.endLoc = this.state.curPosition();
      var prevType = this.state.type;
      this.state.type = type;
      this.state.value = val;
      this.updateContext(prevType);
    };
    Tokenizer2.prototype.readToken_dot = function readToken_dot() {
      var next = this.input.charCodeAt(this.state.pos + 1);
      if (next >= 48 && next <= 57) {
        return this.readNumber(true);
      }
      var next2 = this.input.charCodeAt(this.state.pos + 2);
      if (next === 46 && next2 === 46) {
        this.state.pos += 3;
        return this.finishToken(types2.ellipsis);
      } else {
        ++this.state.pos;
        return this.finishToken(types2.dot);
      }
    };
    Tokenizer2.prototype.readToken_slash = function readToken_slash() {
      if (this.state.exprAllowed) {
        ++this.state.pos;
        return this.readRegexp();
      }
      var next = this.input.charCodeAt(this.state.pos + 1);
      if (next === 61) {
        return this.finishOp(types2.assign, 2);
      } else {
        return this.finishOp(types2.slash, 1);
      }
    };
    Tokenizer2.prototype.readToken_mult_modulo = function readToken_mult_modulo(code) {
      var type = code === 42 ? types2.star : types2.modulo;
      var width = 1;
      var next = this.input.charCodeAt(this.state.pos + 1);
      if (next === 42) {
        width++;
        next = this.input.charCodeAt(this.state.pos + 2);
        type = types2.exponent;
      }
      if (next === 61) {
        width++;
        type = types2.assign;
      }
      return this.finishOp(type, width);
    };
    Tokenizer2.prototype.readToken_pipe_amp = function readToken_pipe_amp(code) {
      var next = this.input.charCodeAt(this.state.pos + 1);
      if (next === code)
        return this.finishOp(code === 124 ? types2.logicalOR : types2.logicalAND, 2);
      if (next === 61)
        return this.finishOp(types2.assign, 2);
      if (code === 124 && next === 125 && this.hasPlugin("flow"))
        return this.finishOp(types2.braceBarR, 2);
      return this.finishOp(code === 124 ? types2.bitwiseOR : types2.bitwiseAND, 1);
    };
    Tokenizer2.prototype.readToken_caret = function readToken_caret() {
      var next = this.input.charCodeAt(this.state.pos + 1);
      if (next === 61) {
        return this.finishOp(types2.assign, 2);
      } else {
        return this.finishOp(types2.bitwiseXOR, 1);
      }
    };
    Tokenizer2.prototype.readToken_plus_min = function readToken_plus_min(code) {
      var next = this.input.charCodeAt(this.state.pos + 1);
      if (next === code) {
        if (next === 45 && this.input.charCodeAt(this.state.pos + 2) === 62 && lineBreak.test(this.input.slice(this.state.lastTokEnd, this.state.pos))) {
          this.skipLineComment(3);
          this.skipSpace();
          return this.nextToken();
        }
        return this.finishOp(types2.incDec, 2);
      }
      if (next === 61) {
        return this.finishOp(types2.assign, 2);
      } else {
        return this.finishOp(types2.plusMin, 1);
      }
    };
    Tokenizer2.prototype.readToken_lt_gt = function readToken_lt_gt(code) {
      var next = this.input.charCodeAt(this.state.pos + 1);
      var size = 1;
      if (next === code) {
        size = code === 62 && this.input.charCodeAt(this.state.pos + 2) === 62 ? 3 : 2;
        if (this.input.charCodeAt(this.state.pos + size) === 61)
          return this.finishOp(types2.assign, size + 1);
        return this.finishOp(types2.bitShift, size);
      }
      if (next === 33 && code === 60 && this.input.charCodeAt(this.state.pos + 2) === 45 && this.input.charCodeAt(this.state.pos + 3) === 45) {
        if (this.inModule)
          this.unexpected();
        this.skipLineComment(4);
        this.skipSpace();
        return this.nextToken();
      }
      if (next === 61) {
        size = 2;
      }
      return this.finishOp(types2.relational, size);
    };
    Tokenizer2.prototype.readToken_eq_excl = function readToken_eq_excl(code) {
      var next = this.input.charCodeAt(this.state.pos + 1);
      if (next === 61)
        return this.finishOp(types2.equality, this.input.charCodeAt(this.state.pos + 2) === 61 ? 3 : 2);
      if (code === 61 && next === 62) {
        this.state.pos += 2;
        return this.finishToken(types2.arrow);
      }
      return this.finishOp(code === 61 ? types2.eq : types2.prefix, 1);
    };
    Tokenizer2.prototype.getTokenFromCode = function getTokenFromCode(code) {
      switch (code) {
        case 46:
          return this.readToken_dot();
        case 40:
          ++this.state.pos;
          return this.finishToken(types2.parenL);
        case 41:
          ++this.state.pos;
          return this.finishToken(types2.parenR);
        case 59:
          ++this.state.pos;
          return this.finishToken(types2.semi);
        case 44:
          ++this.state.pos;
          return this.finishToken(types2.comma);
        case 91:
          ++this.state.pos;
          return this.finishToken(types2.bracketL);
        case 93:
          ++this.state.pos;
          return this.finishToken(types2.bracketR);
        case 123:
          if (this.hasPlugin("flow") && this.input.charCodeAt(this.state.pos + 1) === 124) {
            return this.finishOp(types2.braceBarL, 2);
          } else {
            ++this.state.pos;
            return this.finishToken(types2.braceL);
          }
        case 125:
          ++this.state.pos;
          return this.finishToken(types2.braceR);
        case 58:
          if (this.hasPlugin("functionBind") && this.input.charCodeAt(this.state.pos + 1) === 58) {
            return this.finishOp(types2.doubleColon, 2);
          } else {
            ++this.state.pos;
            return this.finishToken(types2.colon);
          }
        case 63:
          ++this.state.pos;
          return this.finishToken(types2.question);
        case 64:
          ++this.state.pos;
          return this.finishToken(types2.at);
        case 96:
          ++this.state.pos;
          return this.finishToken(types2.backQuote);
        case 48:
          var next = this.input.charCodeAt(this.state.pos + 1);
          if (next === 120 || next === 88)
            return this.readRadixNumber(16);
          if (next === 111 || next === 79)
            return this.readRadixNumber(8);
          if (next === 98 || next === 66)
            return this.readRadixNumber(2);
        case 49:
        case 50:
        case 51:
        case 52:
        case 53:
        case 54:
        case 55:
        case 56:
        case 57:
          return this.readNumber(false);
        case 34:
        case 39:
          return this.readString(code);
        case 47:
          return this.readToken_slash();
        case 37:
        case 42:
          return this.readToken_mult_modulo(code);
        case 124:
        case 38:
          return this.readToken_pipe_amp(code);
        case 94:
          return this.readToken_caret();
        case 43:
        case 45:
          return this.readToken_plus_min(code);
        case 60:
        case 62:
          return this.readToken_lt_gt(code);
        case 61:
        case 33:
          return this.readToken_eq_excl(code);
        case 126:
          return this.finishOp(types2.prefix, 1);
      }
      this.raise(this.state.pos, "Unexpected character '" + codePointToString(code) + "'");
    };
    Tokenizer2.prototype.finishOp = function finishOp(type, size) {
      var str = this.input.slice(this.state.pos, this.state.pos + size);
      this.state.pos += size;
      return this.finishToken(type, str);
    };
    Tokenizer2.prototype.readRegexp = function readRegexp() {
      var start = this.state.pos;
      var escaped = undefined, inClass = undefined;
      for (;; ) {
        if (this.state.pos >= this.input.length)
          this.raise(start, "Unterminated regular expression");
        var ch = this.input.charAt(this.state.pos);
        if (lineBreak.test(ch)) {
          this.raise(start, "Unterminated regular expression");
        }
        if (escaped) {
          escaped = false;
        } else {
          if (ch === "[") {
            inClass = true;
          } else if (ch === "]" && inClass) {
            inClass = false;
          } else if (ch === "/" && !inClass) {
            break;
          }
          escaped = ch === "\\";
        }
        ++this.state.pos;
      }
      var content = this.input.slice(start, this.state.pos);
      ++this.state.pos;
      var mods = this.readWord1();
      if (mods) {
        var validFlags = /^[gmsiyu]*$/;
        if (!validFlags.test(mods))
          this.raise(start, "Invalid regular expression flag");
      }
      return this.finishToken(types2.regexp, {
        pattern: content,
        flags: mods
      });
    };
    Tokenizer2.prototype.readInt = function readInt(radix, len) {
      var start = this.state.pos;
      var total = 0;
      for (var i = 0, e = len == null ? Infinity : len;i < e; ++i) {
        var code = this.input.charCodeAt(this.state.pos);
        var val = undefined;
        if (code >= 97) {
          val = code - 97 + 10;
        } else if (code >= 65) {
          val = code - 65 + 10;
        } else if (code >= 48 && code <= 57) {
          val = code - 48;
        } else {
          val = Infinity;
        }
        if (val >= radix)
          break;
        ++this.state.pos;
        total = total * radix + val;
      }
      if (this.state.pos === start || len != null && this.state.pos - start !== len)
        return null;
      return total;
    };
    Tokenizer2.prototype.readRadixNumber = function readRadixNumber(radix) {
      this.state.pos += 2;
      var val = this.readInt(radix);
      if (val == null)
        this.raise(this.state.start + 2, "Expected number in radix " + radix);
      if (isIdentifierStart(this.fullCharCodeAtPos()))
        this.raise(this.state.pos, "Identifier directly after number");
      return this.finishToken(types2.num, val);
    };
    Tokenizer2.prototype.readNumber = function readNumber(startsWithDot) {
      var start = this.state.pos;
      var octal = this.input.charCodeAt(start) === 48;
      var isFloat = false;
      if (!startsWithDot && this.readInt(10) === null)
        this.raise(start, "Invalid number");
      if (octal && this.state.pos == start + 1)
        octal = false;
      var next = this.input.charCodeAt(this.state.pos);
      if (next === 46 && !octal) {
        ++this.state.pos;
        this.readInt(10);
        isFloat = true;
        next = this.input.charCodeAt(this.state.pos);
      }
      if ((next === 69 || next === 101) && !octal) {
        next = this.input.charCodeAt(++this.state.pos);
        if (next === 43 || next === 45)
          ++this.state.pos;
        if (this.readInt(10) === null)
          this.raise(start, "Invalid number");
        isFloat = true;
      }
      if (isIdentifierStart(this.fullCharCodeAtPos()))
        this.raise(this.state.pos, "Identifier directly after number");
      var str = this.input.slice(start, this.state.pos);
      var val = undefined;
      if (isFloat) {
        val = parseFloat(str);
      } else if (!octal || str.length === 1) {
        val = parseInt(str, 10);
      } else if (this.state.strict) {
        this.raise(start, "Invalid number");
      } else if (/[89]/.test(str)) {
        val = parseInt(str, 10);
      } else {
        val = parseInt(str, 8);
      }
      return this.finishToken(types2.num, val);
    };
    Tokenizer2.prototype.readCodePoint = function readCodePoint(throwOnInvalid) {
      var ch = this.input.charCodeAt(this.state.pos);
      var code = undefined;
      if (ch === 123) {
        var codePos = ++this.state.pos;
        code = this.readHexChar(this.input.indexOf("}", this.state.pos) - this.state.pos, throwOnInvalid);
        ++this.state.pos;
        if (code === null) {
          --this.state.invalidTemplateEscapePosition;
        } else if (code > 1114111) {
          if (throwOnInvalid) {
            this.raise(codePos, "Code point out of bounds");
          } else {
            this.state.invalidTemplateEscapePosition = codePos - 2;
            return null;
          }
        }
      } else {
        code = this.readHexChar(4, throwOnInvalid);
      }
      return code;
    };
    Tokenizer2.prototype.readString = function readString(quote) {
      var out = "", chunkStart = ++this.state.pos;
      for (;; ) {
        if (this.state.pos >= this.input.length)
          this.raise(this.state.start, "Unterminated string constant");
        var ch = this.input.charCodeAt(this.state.pos);
        if (ch === quote)
          break;
        if (ch === 92) {
          out += this.input.slice(chunkStart, this.state.pos);
          out += this.readEscapedChar(false);
          chunkStart = this.state.pos;
        } else {
          if (isNewLine(ch))
            this.raise(this.state.start, "Unterminated string constant");
          ++this.state.pos;
        }
      }
      out += this.input.slice(chunkStart, this.state.pos++);
      return this.finishToken(types2.string, out);
    };
    Tokenizer2.prototype.readTmplToken = function readTmplToken() {
      var out = "", chunkStart = this.state.pos, containsInvalid = false;
      for (;; ) {
        if (this.state.pos >= this.input.length)
          this.raise(this.state.start, "Unterminated template");
        var ch = this.input.charCodeAt(this.state.pos);
        if (ch === 96 || ch === 36 && this.input.charCodeAt(this.state.pos + 1) === 123) {
          if (this.state.pos === this.state.start && this.match(types2.template)) {
            if (ch === 36) {
              this.state.pos += 2;
              return this.finishToken(types2.dollarBraceL);
            } else {
              ++this.state.pos;
              return this.finishToken(types2.backQuote);
            }
          }
          out += this.input.slice(chunkStart, this.state.pos);
          return this.finishToken(types2.template, containsInvalid ? null : out);
        }
        if (ch === 92) {
          out += this.input.slice(chunkStart, this.state.pos);
          var escaped = this.readEscapedChar(true);
          if (escaped === null) {
            containsInvalid = true;
          } else {
            out += escaped;
          }
          chunkStart = this.state.pos;
        } else if (isNewLine(ch)) {
          out += this.input.slice(chunkStart, this.state.pos);
          ++this.state.pos;
          switch (ch) {
            case 13:
              if (this.input.charCodeAt(this.state.pos) === 10)
                ++this.state.pos;
            case 10:
              out += `
`;
              break;
            default:
              out += String.fromCharCode(ch);
              break;
          }
          ++this.state.curLine;
          this.state.lineStart = this.state.pos;
          chunkStart = this.state.pos;
        } else {
          ++this.state.pos;
        }
      }
    };
    Tokenizer2.prototype.readEscapedChar = function readEscapedChar(inTemplate) {
      var throwOnInvalid = !inTemplate;
      var ch = this.input.charCodeAt(++this.state.pos);
      ++this.state.pos;
      switch (ch) {
        case 110:
          return `
`;
        case 114:
          return "\r";
        case 120: {
          var code = this.readHexChar(2, throwOnInvalid);
          return code === null ? null : String.fromCharCode(code);
        }
        case 117: {
          var _code = this.readCodePoint(throwOnInvalid);
          return _code === null ? null : codePointToString(_code);
        }
        case 116:
          return "\t";
        case 98:
          return "\b";
        case 118:
          return "\v";
        case 102:
          return "\f";
        case 13:
          if (this.input.charCodeAt(this.state.pos) === 10)
            ++this.state.pos;
        case 10:
          this.state.lineStart = this.state.pos;
          ++this.state.curLine;
          return "";
        default:
          if (ch >= 48 && ch <= 55) {
            var codePos = this.state.pos - 1;
            var octalStr = this.input.substr(this.state.pos - 1, 3).match(/^[0-7]+/)[0];
            var octal = parseInt(octalStr, 8);
            if (octal > 255) {
              octalStr = octalStr.slice(0, -1);
              octal = parseInt(octalStr, 8);
            }
            if (octal > 0) {
              if (inTemplate) {
                this.state.invalidTemplateEscapePosition = codePos;
                return null;
              } else if (this.state.strict) {
                this.raise(codePos, "Octal literal in strict mode");
              } else if (!this.state.containsOctal) {
                this.state.containsOctal = true;
                this.state.octalPosition = codePos;
              }
            }
            this.state.pos += octalStr.length - 1;
            return String.fromCharCode(octal);
          }
          return String.fromCharCode(ch);
      }
    };
    Tokenizer2.prototype.readHexChar = function readHexChar(len, throwOnInvalid) {
      var codePos = this.state.pos;
      var n = this.readInt(16, len);
      if (n === null) {
        if (throwOnInvalid) {
          this.raise(codePos, "Bad character escape sequence");
        } else {
          this.state.pos = codePos - 1;
          this.state.invalidTemplateEscapePosition = codePos - 1;
        }
      }
      return n;
    };
    Tokenizer2.prototype.readWord1 = function readWord1() {
      this.state.containsEsc = false;
      var word = "", first = true, chunkStart = this.state.pos;
      while (this.state.pos < this.input.length) {
        var ch = this.fullCharCodeAtPos();
        if (isIdentifierChar(ch)) {
          this.state.pos += ch <= 65535 ? 1 : 2;
        } else if (ch === 92) {
          this.state.containsEsc = true;
          word += this.input.slice(chunkStart, this.state.pos);
          var escStart = this.state.pos;
          if (this.input.charCodeAt(++this.state.pos) !== 117) {
            this.raise(this.state.pos, "Expecting Unicode escape sequence \\uXXXX");
          }
          ++this.state.pos;
          var esc = this.readCodePoint(true);
          if (!(first ? isIdentifierStart : isIdentifierChar)(esc, true)) {
            this.raise(escStart, "Invalid Unicode escape");
          }
          word += codePointToString(esc);
          chunkStart = this.state.pos;
        } else {
          break;
        }
        first = false;
      }
      return word + this.input.slice(chunkStart, this.state.pos);
    };
    Tokenizer2.prototype.readWord = function readWord() {
      var word = this.readWord1();
      var type = types2.name;
      if (!this.state.containsEsc && this.isKeyword(word)) {
        type = keywords[word];
      }
      return this.finishToken(type, word);
    };
    Tokenizer2.prototype.braceIsBlock = function braceIsBlock(prevType) {
      if (prevType === types2.colon) {
        var parent = this.curContext();
        if (parent === types$1.braceStatement || parent === types$1.braceExpression) {
          return !parent.isExpr;
        }
      }
      if (prevType === types2._return) {
        return lineBreak.test(this.input.slice(this.state.lastTokEnd, this.state.start));
      }
      if (prevType === types2._else || prevType === types2.semi || prevType === types2.eof || prevType === types2.parenR) {
        return true;
      }
      if (prevType === types2.braceL) {
        return this.curContext() === types$1.braceStatement;
      }
      return !this.state.exprAllowed;
    };
    Tokenizer2.prototype.updateContext = function updateContext(prevType) {
      var type = this.state.type;
      var update = undefined;
      if (type.keyword && prevType === types2.dot) {
        this.state.exprAllowed = false;
      } else if (update = type.updateContext) {
        update.call(this, prevType);
      } else {
        this.state.exprAllowed = type.beforeExpr;
      }
    };
    return Tokenizer2;
  }();
  var plugins = {};
  var frozenDeprecatedWildcardPluginList = ["jsx", "doExpressions", "objectRestSpread", "decorators", "classProperties", "exportExtensions", "asyncGenerators", "functionBind", "functionSent", "dynamicImport", "flow"];
  var Parser = function(_Tokenizer) {
    inherits(Parser2, _Tokenizer);
    function Parser2(options, input) {
      classCallCheck(this, Parser2);
      options = getOptions(options);
      var _this = possibleConstructorReturn(this, _Tokenizer.call(this, options, input));
      _this.options = options;
      _this.inModule = _this.options.sourceType === "module";
      _this.input = input;
      _this.plugins = _this.loadPlugins(_this.options.plugins);
      _this.filename = options.sourceFilename;
      if (_this.state.pos === 0 && _this.input[0] === "#" && _this.input[1] === "!") {
        _this.skipLineComment(2);
      }
      return _this;
    }
    Parser2.prototype.isReservedWord = function isReservedWord(word) {
      if (word === "await") {
        return this.inModule;
      } else {
        return reservedWords[6](word);
      }
    };
    Parser2.prototype.hasPlugin = function hasPlugin(name) {
      if (this.plugins["*"] && frozenDeprecatedWildcardPluginList.indexOf(name) > -1) {
        return true;
      }
      return !!this.plugins[name];
    };
    Parser2.prototype.extend = function extend(name, f) {
      this[name] = f(this[name]);
    };
    Parser2.prototype.loadAllPlugins = function loadAllPlugins() {
      var _this2 = this;
      var pluginNames = Object.keys(plugins).filter(function(name) {
        return name !== "flow" && name !== "estree";
      });
      pluginNames.push("flow");
      pluginNames.forEach(function(name) {
        var plugin = plugins[name];
        if (plugin)
          plugin(_this2);
      });
    };
    Parser2.prototype.loadPlugins = function loadPlugins(pluginList) {
      if (pluginList.indexOf("*") >= 0) {
        this.loadAllPlugins();
        return { "*": true };
      }
      var pluginMap = {};
      if (pluginList.indexOf("flow") >= 0) {
        pluginList = pluginList.filter(function(plugin2) {
          return plugin2 !== "flow";
        });
        pluginList.push("flow");
      }
      if (pluginList.indexOf("estree") >= 0) {
        pluginList = pluginList.filter(function(plugin2) {
          return plugin2 !== "estree";
        });
        pluginList.unshift("estree");
      }
      for (var _iterator = pluginList, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();; ) {
        var _ref;
        if (_isArray) {
          if (_i >= _iterator.length)
            break;
          _ref = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done)
            break;
          _ref = _i.value;
        }
        var name = _ref;
        if (!pluginMap[name]) {
          pluginMap[name] = true;
          var plugin = plugins[name];
          if (plugin)
            plugin(this);
        }
      }
      return pluginMap;
    };
    Parser2.prototype.parse = function parse2() {
      var file = this.startNode();
      var program = this.startNode();
      this.nextToken();
      return this.parseTopLevel(file, program);
    };
    return Parser2;
  }(Tokenizer);
  var pp = Parser.prototype;
  pp.addExtra = function(node, key, val) {
    if (!node)
      return;
    var extra = node.extra = node.extra || {};
    extra[key] = val;
  };
  pp.isRelational = function(op) {
    return this.match(types2.relational) && this.state.value === op;
  };
  pp.expectRelational = function(op) {
    if (this.isRelational(op)) {
      this.next();
    } else {
      this.unexpected(null, types2.relational);
    }
  };
  pp.isContextual = function(name) {
    return this.match(types2.name) && this.state.value === name;
  };
  pp.eatContextual = function(name) {
    return this.state.value === name && this.eat(types2.name);
  };
  pp.expectContextual = function(name, message) {
    if (!this.eatContextual(name))
      this.unexpected(null, message);
  };
  pp.canInsertSemicolon = function() {
    return this.match(types2.eof) || this.match(types2.braceR) || lineBreak.test(this.input.slice(this.state.lastTokEnd, this.state.start));
  };
  pp.isLineTerminator = function() {
    return this.eat(types2.semi) || this.canInsertSemicolon();
  };
  pp.semicolon = function() {
    if (!this.isLineTerminator())
      this.unexpected(null, types2.semi);
  };
  pp.expect = function(type, pos) {
    return this.eat(type) || this.unexpected(pos, type);
  };
  pp.unexpected = function(pos) {
    var messageOrType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "Unexpected token";
    if (messageOrType && (typeof messageOrType === "undefined" ? "undefined" : _typeof(messageOrType)) === "object" && messageOrType.label) {
      messageOrType = "Unexpected token, expected " + messageOrType.label;
    }
    this.raise(pos != null ? pos : this.state.start, messageOrType);
  };
  var pp$1 = Parser.prototype;
  pp$1.parseTopLevel = function(file, program) {
    program.sourceType = this.options.sourceType;
    this.parseBlockBody(program, true, true, types2.eof);
    file.program = this.finishNode(program, "Program");
    file.comments = this.state.comments;
    file.tokens = this.state.tokens;
    return this.finishNode(file, "File");
  };
  var loopLabel = { kind: "loop" };
  var switchLabel = { kind: "switch" };
  pp$1.stmtToDirective = function(stmt) {
    var expr = stmt.expression;
    var directiveLiteral = this.startNodeAt(expr.start, expr.loc.start);
    var directive = this.startNodeAt(stmt.start, stmt.loc.start);
    var raw = this.input.slice(expr.start, expr.end);
    var val = directiveLiteral.value = raw.slice(1, -1);
    this.addExtra(directiveLiteral, "raw", raw);
    this.addExtra(directiveLiteral, "rawValue", val);
    directive.value = this.finishNodeAt(directiveLiteral, "DirectiveLiteral", expr.end, expr.loc.end);
    return this.finishNodeAt(directive, "Directive", stmt.end, stmt.loc.end);
  };
  pp$1.parseStatement = function(declaration, topLevel) {
    if (this.match(types2.at)) {
      this.parseDecorators(true);
    }
    var starttype = this.state.type;
    var node = this.startNode();
    switch (starttype) {
      case types2._break:
      case types2._continue:
        return this.parseBreakContinueStatement(node, starttype.keyword);
      case types2._debugger:
        return this.parseDebuggerStatement(node);
      case types2._do:
        return this.parseDoStatement(node);
      case types2._for:
        return this.parseForStatement(node);
      case types2._function:
        if (!declaration)
          this.unexpected();
        return this.parseFunctionStatement(node);
      case types2._class:
        if (!declaration)
          this.unexpected();
        return this.parseClass(node, true);
      case types2._if:
        return this.parseIfStatement(node);
      case types2._return:
        return this.parseReturnStatement(node);
      case types2._switch:
        return this.parseSwitchStatement(node);
      case types2._throw:
        return this.parseThrowStatement(node);
      case types2._try:
        return this.parseTryStatement(node);
      case types2._let:
      case types2._const:
        if (!declaration)
          this.unexpected();
      case types2._var:
        return this.parseVarStatement(node, starttype);
      case types2._while:
        return this.parseWhileStatement(node);
      case types2._with:
        return this.parseWithStatement(node);
      case types2.braceL:
        return this.parseBlock();
      case types2.semi:
        return this.parseEmptyStatement(node);
      case types2._export:
      case types2._import:
        if (this.hasPlugin("dynamicImport") && this.lookahead().type === types2.parenL)
          break;
        if (!this.options.allowImportExportEverywhere) {
          if (!topLevel) {
            this.raise(this.state.start, "'import' and 'export' may only appear at the top level");
          }
          if (!this.inModule) {
            this.raise(this.state.start, `'import' and 'export' may appear only with 'sourceType: "module"'`);
          }
        }
        return starttype === types2._import ? this.parseImport(node) : this.parseExport(node);
      case types2.name:
        if (this.state.value === "async") {
          var state = this.state.clone();
          this.next();
          if (this.match(types2._function) && !this.canInsertSemicolon()) {
            this.expect(types2._function);
            return this.parseFunction(node, true, false, true);
          } else {
            this.state = state;
          }
        }
    }
    var maybeName = this.state.value;
    var expr = this.parseExpression();
    if (starttype === types2.name && expr.type === "Identifier" && this.eat(types2.colon)) {
      return this.parseLabeledStatement(node, maybeName, expr);
    } else {
      return this.parseExpressionStatement(node, expr);
    }
  };
  pp$1.takeDecorators = function(node) {
    if (this.state.decorators.length) {
      node.decorators = this.state.decorators;
      this.state.decorators = [];
    }
  };
  pp$1.parseDecorators = function(allowExport) {
    while (this.match(types2.at)) {
      var decorator = this.parseDecorator();
      this.state.decorators.push(decorator);
    }
    if (allowExport && this.match(types2._export)) {
      return;
    }
    if (!this.match(types2._class)) {
      this.raise(this.state.start, "Leading decorators must be attached to a class declaration");
    }
  };
  pp$1.parseDecorator = function() {
    if (!this.hasPlugin("decorators")) {
      this.unexpected();
    }
    var node = this.startNode();
    this.next();
    node.expression = this.parseMaybeAssign();
    return this.finishNode(node, "Decorator");
  };
  pp$1.parseBreakContinueStatement = function(node, keyword) {
    var isBreak = keyword === "break";
    this.next();
    if (this.isLineTerminator()) {
      node.label = null;
    } else if (!this.match(types2.name)) {
      this.unexpected();
    } else {
      node.label = this.parseIdentifier();
      this.semicolon();
    }
    var i = undefined;
    for (i = 0;i < this.state.labels.length; ++i) {
      var lab = this.state.labels[i];
      if (node.label == null || lab.name === node.label.name) {
        if (lab.kind != null && (isBreak || lab.kind === "loop"))
          break;
        if (node.label && isBreak)
          break;
      }
    }
    if (i === this.state.labels.length)
      this.raise(node.start, "Unsyntactic " + keyword);
    return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement");
  };
  pp$1.parseDebuggerStatement = function(node) {
    this.next();
    this.semicolon();
    return this.finishNode(node, "DebuggerStatement");
  };
  pp$1.parseDoStatement = function(node) {
    this.next();
    this.state.labels.push(loopLabel);
    node.body = this.parseStatement(false);
    this.state.labels.pop();
    this.expect(types2._while);
    node.test = this.parseParenExpression();
    this.eat(types2.semi);
    return this.finishNode(node, "DoWhileStatement");
  };
  pp$1.parseForStatement = function(node) {
    this.next();
    this.state.labels.push(loopLabel);
    var forAwait = false;
    if (this.hasPlugin("asyncGenerators") && this.state.inAsync && this.isContextual("await")) {
      forAwait = true;
      this.next();
    }
    this.expect(types2.parenL);
    if (this.match(types2.semi)) {
      if (forAwait) {
        this.unexpected();
      }
      return this.parseFor(node, null);
    }
    if (this.match(types2._var) || this.match(types2._let) || this.match(types2._const)) {
      var _init = this.startNode();
      var varKind = this.state.type;
      this.next();
      this.parseVar(_init, true, varKind);
      this.finishNode(_init, "VariableDeclaration");
      if (this.match(types2._in) || this.isContextual("of")) {
        if (_init.declarations.length === 1 && !_init.declarations[0].init) {
          return this.parseForIn(node, _init, forAwait);
        }
      }
      if (forAwait) {
        this.unexpected();
      }
      return this.parseFor(node, _init);
    }
    var refShorthandDefaultPos = { start: 0 };
    var init = this.parseExpression(true, refShorthandDefaultPos);
    if (this.match(types2._in) || this.isContextual("of")) {
      var description = this.isContextual("of") ? "for-of statement" : "for-in statement";
      this.toAssignable(init, undefined, description);
      this.checkLVal(init, undefined, undefined, description);
      return this.parseForIn(node, init, forAwait);
    } else if (refShorthandDefaultPos.start) {
      this.unexpected(refShorthandDefaultPos.start);
    }
    if (forAwait) {
      this.unexpected();
    }
    return this.parseFor(node, init);
  };
  pp$1.parseFunctionStatement = function(node) {
    this.next();
    return this.parseFunction(node, true);
  };
  pp$1.parseIfStatement = function(node) {
    this.next();
    node.test = this.parseParenExpression();
    node.consequent = this.parseStatement(false);
    node.alternate = this.eat(types2._else) ? this.parseStatement(false) : null;
    return this.finishNode(node, "IfStatement");
  };
  pp$1.parseReturnStatement = function(node) {
    if (!this.state.inFunction && !this.options.allowReturnOutsideFunction) {
      this.raise(this.state.start, "'return' outside of function");
    }
    this.next();
    if (this.isLineTerminator()) {
      node.argument = null;
    } else {
      node.argument = this.parseExpression();
      this.semicolon();
    }
    return this.finishNode(node, "ReturnStatement");
  };
  pp$1.parseSwitchStatement = function(node) {
    this.next();
    node.discriminant = this.parseParenExpression();
    node.cases = [];
    this.expect(types2.braceL);
    this.state.labels.push(switchLabel);
    var cur = undefined;
    for (var sawDefault;!this.match(types2.braceR); ) {
      if (this.match(types2._case) || this.match(types2._default)) {
        var isCase = this.match(types2._case);
        if (cur)
          this.finishNode(cur, "SwitchCase");
        node.cases.push(cur = this.startNode());
        cur.consequent = [];
        this.next();
        if (isCase) {
          cur.test = this.parseExpression();
        } else {
          if (sawDefault)
            this.raise(this.state.lastTokStart, "Multiple default clauses");
          sawDefault = true;
          cur.test = null;
        }
        this.expect(types2.colon);
      } else {
        if (cur) {
          cur.consequent.push(this.parseStatement(true));
        } else {
          this.unexpected();
        }
      }
    }
    if (cur)
      this.finishNode(cur, "SwitchCase");
    this.next();
    this.state.labels.pop();
    return this.finishNode(node, "SwitchStatement");
  };
  pp$1.parseThrowStatement = function(node) {
    this.next();
    if (lineBreak.test(this.input.slice(this.state.lastTokEnd, this.state.start)))
      this.raise(this.state.lastTokEnd, "Illegal newline after throw");
    node.argument = this.parseExpression();
    this.semicolon();
    return this.finishNode(node, "ThrowStatement");
  };
  var empty = [];
  pp$1.parseTryStatement = function(node) {
    this.next();
    node.block = this.parseBlock();
    node.handler = null;
    if (this.match(types2._catch)) {
      var clause = this.startNode();
      this.next();
      this.expect(types2.parenL);
      clause.param = this.parseBindingAtom();
      this.checkLVal(clause.param, true, Object.create(null), "catch clause");
      this.expect(types2.parenR);
      clause.body = this.parseBlock();
      node.handler = this.finishNode(clause, "CatchClause");
    }
    node.guardedHandlers = empty;
    node.finalizer = this.eat(types2._finally) ? this.parseBlock() : null;
    if (!node.handler && !node.finalizer) {
      this.raise(node.start, "Missing catch or finally clause");
    }
    return this.finishNode(node, "TryStatement");
  };
  pp$1.parseVarStatement = function(node, kind) {
    this.next();
    this.parseVar(node, false, kind);
    this.semicolon();
    return this.finishNode(node, "VariableDeclaration");
  };
  pp$1.parseWhileStatement = function(node) {
    this.next();
    node.test = this.parseParenExpression();
    this.state.labels.push(loopLabel);
    node.body = this.parseStatement(false);
    this.state.labels.pop();
    return this.finishNode(node, "WhileStatement");
  };
  pp$1.parseWithStatement = function(node) {
    if (this.state.strict)
      this.raise(this.state.start, "'with' in strict mode");
    this.next();
    node.object = this.parseParenExpression();
    node.body = this.parseStatement(false);
    return this.finishNode(node, "WithStatement");
  };
  pp$1.parseEmptyStatement = function(node) {
    this.next();
    return this.finishNode(node, "EmptyStatement");
  };
  pp$1.parseLabeledStatement = function(node, maybeName, expr) {
    for (var _iterator = this.state.labels, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();; ) {
      var _ref;
      if (_isArray) {
        if (_i >= _iterator.length)
          break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done)
          break;
        _ref = _i.value;
      }
      var _label = _ref;
      if (_label.name === maybeName) {
        this.raise(expr.start, "Label '" + maybeName + "' is already declared");
      }
    }
    var kind = this.state.type.isLoop ? "loop" : this.match(types2._switch) ? "switch" : null;
    for (var i = this.state.labels.length - 1;i >= 0; i--) {
      var label = this.state.labels[i];
      if (label.statementStart === node.start) {
        label.statementStart = this.state.start;
        label.kind = kind;
      } else {
        break;
      }
    }
    this.state.labels.push({ name: maybeName, kind, statementStart: this.state.start });
    node.body = this.parseStatement(true);
    this.state.labels.pop();
    node.label = expr;
    return this.finishNode(node, "LabeledStatement");
  };
  pp$1.parseExpressionStatement = function(node, expr) {
    node.expression = expr;
    this.semicolon();
    return this.finishNode(node, "ExpressionStatement");
  };
  pp$1.parseBlock = function(allowDirectives) {
    var node = this.startNode();
    this.expect(types2.braceL);
    this.parseBlockBody(node, allowDirectives, false, types2.braceR);
    return this.finishNode(node, "BlockStatement");
  };
  pp$1.isValidDirective = function(stmt) {
    return stmt.type === "ExpressionStatement" && stmt.expression.type === "StringLiteral" && !stmt.expression.extra.parenthesized;
  };
  pp$1.parseBlockBody = function(node, allowDirectives, topLevel, end) {
    node.body = [];
    node.directives = [];
    var parsedNonDirective = false;
    var oldStrict = undefined;
    var octalPosition = undefined;
    while (!this.eat(end)) {
      if (!parsedNonDirective && this.state.containsOctal && !octalPosition) {
        octalPosition = this.state.octalPosition;
      }
      var stmt = this.parseStatement(true, topLevel);
      if (allowDirectives && !parsedNonDirective && this.isValidDirective(stmt)) {
        var directive = this.stmtToDirective(stmt);
        node.directives.push(directive);
        if (oldStrict === undefined && directive.value.value === "use strict") {
          oldStrict = this.state.strict;
          this.setStrict(true);
          if (octalPosition) {
            this.raise(octalPosition, "Octal literal in strict mode");
          }
        }
        continue;
      }
      parsedNonDirective = true;
      node.body.push(stmt);
    }
    if (oldStrict === false) {
      this.setStrict(false);
    }
  };
  pp$1.parseFor = function(node, init) {
    node.init = init;
    this.expect(types2.semi);
    node.test = this.match(types2.semi) ? null : this.parseExpression();
    this.expect(types2.semi);
    node.update = this.match(types2.parenR) ? null : this.parseExpression();
    this.expect(types2.parenR);
    node.body = this.parseStatement(false);
    this.state.labels.pop();
    return this.finishNode(node, "ForStatement");
  };
  pp$1.parseForIn = function(node, init, forAwait) {
    var type = undefined;
    if (forAwait) {
      this.eatContextual("of");
      type = "ForAwaitStatement";
    } else {
      type = this.match(types2._in) ? "ForInStatement" : "ForOfStatement";
      this.next();
    }
    node.left = init;
    node.right = this.parseExpression();
    this.expect(types2.parenR);
    node.body = this.parseStatement(false);
    this.state.labels.pop();
    return this.finishNode(node, type);
  };
  pp$1.parseVar = function(node, isFor, kind) {
    node.declarations = [];
    node.kind = kind.keyword;
    for (;; ) {
      var decl = this.startNode();
      this.parseVarHead(decl);
      if (this.eat(types2.eq)) {
        decl.init = this.parseMaybeAssign(isFor);
      } else if (kind === types2._const && !(this.match(types2._in) || this.isContextual("of"))) {
        this.unexpected();
      } else if (decl.id.type !== "Identifier" && !(isFor && (this.match(types2._in) || this.isContextual("of")))) {
        this.raise(this.state.lastTokEnd, "Complex binding patterns require an initialization value");
      } else {
        decl.init = null;
      }
      node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
      if (!this.eat(types2.comma))
        break;
    }
    return node;
  };
  pp$1.parseVarHead = function(decl) {
    decl.id = this.parseBindingAtom();
    this.checkLVal(decl.id, true, undefined, "variable declaration");
  };
  pp$1.parseFunction = function(node, isStatement, allowExpressionBody, isAsync2, optionalId) {
    var oldInMethod = this.state.inMethod;
    this.state.inMethod = false;
    this.initFunction(node, isAsync2);
    if (this.match(types2.star)) {
      if (node.async && !this.hasPlugin("asyncGenerators")) {
        this.unexpected();
      } else {
        node.generator = true;
        this.next();
      }
    }
    if (isStatement && !optionalId && !this.match(types2.name) && !this.match(types2._yield)) {
      this.unexpected();
    }
    if (this.match(types2.name) || this.match(types2._yield)) {
      node.id = this.parseBindingIdentifier();
    }
    this.parseFunctionParams(node);
    this.parseFunctionBody(node, allowExpressionBody);
    this.state.inMethod = oldInMethod;
    return this.finishNode(node, isStatement ? "FunctionDeclaration" : "FunctionExpression");
  };
  pp$1.parseFunctionParams = function(node) {
    this.expect(types2.parenL);
    node.params = this.parseBindingList(types2.parenR);
  };
  pp$1.parseClass = function(node, isStatement, optionalId) {
    this.next();
    this.takeDecorators(node);
    this.parseClassId(node, isStatement, optionalId);
    this.parseClassSuper(node);
    this.parseClassBody(node);
    return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression");
  };
  pp$1.isClassProperty = function() {
    return this.match(types2.eq) || this.match(types2.semi) || this.match(types2.braceR);
  };
  pp$1.isClassMethod = function() {
    return this.match(types2.parenL);
  };
  pp$1.isNonstaticConstructor = function(method) {
    return !method.computed && !method.static && (method.key.name === "constructor" || method.key.value === "constructor");
  };
  pp$1.parseClassBody = function(node) {
    var oldStrict = this.state.strict;
    this.state.strict = true;
    var hadConstructorCall = false;
    var hadConstructor = false;
    var decorators = [];
    var classBody = this.startNode();
    classBody.body = [];
    this.expect(types2.braceL);
    while (!this.eat(types2.braceR)) {
      if (this.eat(types2.semi)) {
        if (decorators.length > 0) {
          this.raise(this.state.lastTokEnd, "Decorators must not be followed by a semicolon");
        }
        continue;
      }
      if (this.match(types2.at)) {
        decorators.push(this.parseDecorator());
        continue;
      }
      var method = this.startNode();
      if (decorators.length) {
        method.decorators = decorators;
        decorators = [];
      }
      method.static = false;
      if (this.match(types2.name) && this.state.value === "static") {
        var key = this.parseIdentifier(true);
        if (this.isClassMethod()) {
          method.kind = "method";
          method.computed = false;
          method.key = key;
          this.parseClassMethod(classBody, method, false, false);
          continue;
        } else if (this.isClassProperty()) {
          method.computed = false;
          method.key = key;
          classBody.body.push(this.parseClassProperty(method));
          continue;
        }
        method.static = true;
      }
      if (this.eat(types2.star)) {
        method.kind = "method";
        this.parsePropertyName(method);
        if (this.isNonstaticConstructor(method)) {
          this.raise(method.key.start, "Constructor can't be a generator");
        }
        if (!method.computed && method.static && (method.key.name === "prototype" || method.key.value === "prototype")) {
          this.raise(method.key.start, "Classes may not have static property named prototype");
        }
        this.parseClassMethod(classBody, method, true, false);
      } else {
        var isSimple = this.match(types2.name);
        var _key = this.parsePropertyName(method);
        if (!method.computed && method.static && (method.key.name === "prototype" || method.key.value === "prototype")) {
          this.raise(method.key.start, "Classes may not have static property named prototype");
        }
        if (this.isClassMethod()) {
          if (this.isNonstaticConstructor(method)) {
            if (hadConstructor) {
              this.raise(_key.start, "Duplicate constructor in the same class");
            } else if (method.decorators) {
              this.raise(method.start, "You can't attach decorators to a class constructor");
            }
            hadConstructor = true;
            method.kind = "constructor";
          } else {
            method.kind = "method";
          }
          this.parseClassMethod(classBody, method, false, false);
        } else if (this.isClassProperty()) {
          if (this.isNonstaticConstructor(method)) {
            this.raise(method.key.start, "Classes may not have a non-static field named 'constructor'");
          }
          classBody.body.push(this.parseClassProperty(method));
        } else if (isSimple && _key.name === "async" && !this.isLineTerminator()) {
          var isGenerator = this.hasPlugin("asyncGenerators") && this.eat(types2.star);
          method.kind = "method";
          this.parsePropertyName(method);
          if (this.isNonstaticConstructor(method)) {
            this.raise(method.key.start, "Constructor can't be an async function");
          }
          this.parseClassMethod(classBody, method, isGenerator, true);
        } else if (isSimple && (_key.name === "get" || _key.name === "set") && !(this.isLineTerminator() && this.match(types2.star))) {
          method.kind = _key.name;
          this.parsePropertyName(method);
          if (this.isNonstaticConstructor(method)) {
            this.raise(method.key.start, "Constructor can't have get/set modifier");
          }
          this.parseClassMethod(classBody, method, false, false);
          this.checkGetterSetterParamCount(method);
        } else if (this.hasPlugin("classConstructorCall") && isSimple && _key.name === "call" && this.match(types2.name) && this.state.value === "constructor") {
          if (hadConstructorCall) {
            this.raise(method.start, "Duplicate constructor call in the same class");
          } else if (method.decorators) {
            this.raise(method.start, "You can't attach decorators to a class constructor");
          }
          hadConstructorCall = true;
          method.kind = "constructorCall";
          this.parsePropertyName(method);
          this.parseClassMethod(classBody, method, false, false);
        } else if (this.isLineTerminator()) {
          if (this.isNonstaticConstructor(method)) {
            this.raise(method.key.start, "Classes may not have a non-static field named 'constructor'");
          }
          classBody.body.push(this.parseClassProperty(method));
        } else {
          this.unexpected();
        }
      }
    }
    if (decorators.length) {
      this.raise(this.state.start, "You have trailing decorators with no method");
    }
    node.body = this.finishNode(classBody, "ClassBody");
    this.state.strict = oldStrict;
  };
  pp$1.parseClassProperty = function(node) {
    this.state.inClassProperty = true;
    if (this.match(types2.eq)) {
      if (!this.hasPlugin("classProperties"))
        this.unexpected();
      this.next();
      node.value = this.parseMaybeAssign();
    } else {
      node.value = null;
    }
    this.semicolon();
    this.state.inClassProperty = false;
    return this.finishNode(node, "ClassProperty");
  };
  pp$1.parseClassMethod = function(classBody, method, isGenerator, isAsync2) {
    this.parseMethod(method, isGenerator, isAsync2);
    classBody.body.push(this.finishNode(method, "ClassMethod"));
  };
  pp$1.parseClassId = function(node, isStatement, optionalId) {
    if (this.match(types2.name)) {
      node.id = this.parseIdentifier();
    } else {
      if (optionalId || !isStatement) {
        node.id = null;
      } else {
        this.unexpected();
      }
    }
  };
  pp$1.parseClassSuper = function(node) {
    node.superClass = this.eat(types2._extends) ? this.parseExprSubscripts() : null;
  };
  pp$1.parseExport = function(node) {
    this.next();
    if (this.match(types2.star)) {
      var specifier = this.startNode();
      this.next();
      if (this.hasPlugin("exportExtensions") && this.eatContextual("as")) {
        specifier.exported = this.parseIdentifier();
        node.specifiers = [this.finishNode(specifier, "ExportNamespaceSpecifier")];
        this.parseExportSpecifiersMaybe(node);
        this.parseExportFrom(node, true);
      } else {
        this.parseExportFrom(node, true);
        return this.finishNode(node, "ExportAllDeclaration");
      }
    } else if (this.hasPlugin("exportExtensions") && this.isExportDefaultSpecifier()) {
      var _specifier = this.startNode();
      _specifier.exported = this.parseIdentifier(true);
      node.specifiers = [this.finishNode(_specifier, "ExportDefaultSpecifier")];
      if (this.match(types2.comma) && this.lookahead().type === types2.star) {
        this.expect(types2.comma);
        var _specifier2 = this.startNode();
        this.expect(types2.star);
        this.expectContextual("as");
        _specifier2.exported = this.parseIdentifier();
        node.specifiers.push(this.finishNode(_specifier2, "ExportNamespaceSpecifier"));
      } else {
        this.parseExportSpecifiersMaybe(node);
      }
      this.parseExportFrom(node, true);
    } else if (this.eat(types2._default)) {
      var expr = this.startNode();
      var needsSemi = false;
      if (this.eat(types2._function)) {
        expr = this.parseFunction(expr, true, false, false, true);
      } else if (this.match(types2._class)) {
        expr = this.parseClass(expr, true, true);
      } else {
        needsSemi = true;
        expr = this.parseMaybeAssign();
      }
      node.declaration = expr;
      if (needsSemi)
        this.semicolon();
      this.checkExport(node, true, true);
      return this.finishNode(node, "ExportDefaultDeclaration");
    } else if (this.shouldParseExportDeclaration()) {
      node.specifiers = [];
      node.source = null;
      node.declaration = this.parseExportDeclaration(node);
    } else {
      node.declaration = null;
      node.specifiers = this.parseExportSpecifiers();
      this.parseExportFrom(node);
    }
    this.checkExport(node, true);
    return this.finishNode(node, "ExportNamedDeclaration");
  };
  pp$1.parseExportDeclaration = function() {
    return this.parseStatement(true);
  };
  pp$1.isExportDefaultSpecifier = function() {
    if (this.match(types2.name)) {
      return this.state.value !== "async";
    }
    if (!this.match(types2._default)) {
      return false;
    }
    var lookahead = this.lookahead();
    return lookahead.type === types2.comma || lookahead.type === types2.name && lookahead.value === "from";
  };
  pp$1.parseExportSpecifiersMaybe = function(node) {
    if (this.eat(types2.comma)) {
      node.specifiers = node.specifiers.concat(this.parseExportSpecifiers());
    }
  };
  pp$1.parseExportFrom = function(node, expect) {
    if (this.eatContextual("from")) {
      node.source = this.match(types2.string) ? this.parseExprAtom() : this.unexpected();
      this.checkExport(node);
    } else {
      if (expect) {
        this.unexpected();
      } else {
        node.source = null;
      }
    }
    this.semicolon();
  };
  pp$1.shouldParseExportDeclaration = function() {
    return this.state.type.keyword === "var" || this.state.type.keyword === "const" || this.state.type.keyword === "let" || this.state.type.keyword === "function" || this.state.type.keyword === "class" || this.isContextual("async");
  };
  pp$1.checkExport = function(node, checkNames, isDefault) {
    if (checkNames) {
      if (isDefault) {
        this.checkDuplicateExports(node, "default");
      } else if (node.specifiers && node.specifiers.length) {
        for (var _iterator2 = node.specifiers, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();; ) {
          var _ref2;
          if (_isArray2) {
            if (_i2 >= _iterator2.length)
              break;
            _ref2 = _iterator2[_i2++];
          } else {
            _i2 = _iterator2.next();
            if (_i2.done)
              break;
            _ref2 = _i2.value;
          }
          var specifier = _ref2;
          this.checkDuplicateExports(specifier, specifier.exported.name);
        }
      } else if (node.declaration) {
        if (node.declaration.type === "FunctionDeclaration" || node.declaration.type === "ClassDeclaration") {
          this.checkDuplicateExports(node, node.declaration.id.name);
        } else if (node.declaration.type === "VariableDeclaration") {
          for (var _iterator3 = node.declaration.declarations, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();; ) {
            var _ref3;
            if (_isArray3) {
              if (_i3 >= _iterator3.length)
                break;
              _ref3 = _iterator3[_i3++];
            } else {
              _i3 = _iterator3.next();
              if (_i3.done)
                break;
              _ref3 = _i3.value;
            }
            var declaration = _ref3;
            this.checkDeclaration(declaration.id);
          }
        }
      }
    }
    if (this.state.decorators.length) {
      var isClass = node.declaration && (node.declaration.type === "ClassDeclaration" || node.declaration.type === "ClassExpression");
      if (!node.declaration || !isClass) {
        this.raise(node.start, "You can only use decorators on an export when exporting a class");
      }
      this.takeDecorators(node.declaration);
    }
  };
  pp$1.checkDeclaration = function(node) {
    if (node.type === "ObjectPattern") {
      for (var _iterator4 = node.properties, _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator]();; ) {
        var _ref4;
        if (_isArray4) {
          if (_i4 >= _iterator4.length)
            break;
          _ref4 = _iterator4[_i4++];
        } else {
          _i4 = _iterator4.next();
          if (_i4.done)
            break;
          _ref4 = _i4.value;
        }
        var prop = _ref4;
        this.checkDeclaration(prop);
      }
    } else if (node.type === "ArrayPattern") {
      for (var _iterator5 = node.elements, _isArray5 = Array.isArray(_iterator5), _i5 = 0, _iterator5 = _isArray5 ? _iterator5 : _iterator5[Symbol.iterator]();; ) {
        var _ref5;
        if (_isArray5) {
          if (_i5 >= _iterator5.length)
            break;
          _ref5 = _iterator5[_i5++];
        } else {
          _i5 = _iterator5.next();
          if (_i5.done)
            break;
          _ref5 = _i5.value;
        }
        var elem = _ref5;
        if (elem) {
          this.checkDeclaration(elem);
        }
      }
    } else if (node.type === "ObjectProperty") {
      this.checkDeclaration(node.value);
    } else if (node.type === "RestElement" || node.type === "RestProperty") {
      this.checkDeclaration(node.argument);
    } else if (node.type === "Identifier") {
      this.checkDuplicateExports(node, node.name);
    }
  };
  pp$1.checkDuplicateExports = function(node, name) {
    if (this.state.exportedIdentifiers.indexOf(name) > -1) {
      this.raiseDuplicateExportError(node, name);
    }
    this.state.exportedIdentifiers.push(name);
  };
  pp$1.raiseDuplicateExportError = function(node, name) {
    this.raise(node.start, name === "default" ? "Only one default export allowed per module." : "`" + name + "` has already been exported. Exported identifiers must be unique.");
  };
  pp$1.parseExportSpecifiers = function() {
    var nodes = [];
    var first = true;
    var needsFrom = undefined;
    this.expect(types2.braceL);
    while (!this.eat(types2.braceR)) {
      if (first) {
        first = false;
      } else {
        this.expect(types2.comma);
        if (this.eat(types2.braceR))
          break;
      }
      var isDefault = this.match(types2._default);
      if (isDefault && !needsFrom)
        needsFrom = true;
      var node = this.startNode();
      node.local = this.parseIdentifier(isDefault);
      node.exported = this.eatContextual("as") ? this.parseIdentifier(true) : node.local.__clone();
      nodes.push(this.finishNode(node, "ExportSpecifier"));
    }
    if (needsFrom && !this.isContextual("from")) {
      this.unexpected();
    }
    return nodes;
  };
  pp$1.parseImport = function(node) {
    this.eat(types2._import);
    if (this.match(types2.string)) {
      node.specifiers = [];
      node.source = this.parseExprAtom();
    } else {
      node.specifiers = [];
      this.parseImportSpecifiers(node);
      this.expectContextual("from");
      node.source = this.match(types2.string) ? this.parseExprAtom() : this.unexpected();
    }
    this.semicolon();
    return this.finishNode(node, "ImportDeclaration");
  };
  pp$1.parseImportSpecifiers = function(node) {
    var first = true;
    if (this.match(types2.name)) {
      var startPos = this.state.start;
      var startLoc = this.state.startLoc;
      node.specifiers.push(this.parseImportSpecifierDefault(this.parseIdentifier(), startPos, startLoc));
      if (!this.eat(types2.comma))
        return;
    }
    if (this.match(types2.star)) {
      var specifier = this.startNode();
      this.next();
      this.expectContextual("as");
      specifier.local = this.parseIdentifier();
      this.checkLVal(specifier.local, true, undefined, "import namespace specifier");
      node.specifiers.push(this.finishNode(specifier, "ImportNamespaceSpecifier"));
      return;
    }
    this.expect(types2.braceL);
    while (!this.eat(types2.braceR)) {
      if (first) {
        first = false;
      } else {
        if (this.eat(types2.colon)) {
          this.unexpected(null, "ES2015 named imports do not destructure. Use another statement for destructuring after the import.");
        }
        this.expect(types2.comma);
        if (this.eat(types2.braceR))
          break;
      }
      this.parseImportSpecifier(node);
    }
  };
  pp$1.parseImportSpecifier = function(node) {
    var specifier = this.startNode();
    specifier.imported = this.parseIdentifier(true);
    if (this.eatContextual("as")) {
      specifier.local = this.parseIdentifier();
    } else {
      this.checkReservedWord(specifier.imported.name, specifier.start, true, true);
      specifier.local = specifier.imported.__clone();
    }
    this.checkLVal(specifier.local, true, undefined, "import specifier");
    node.specifiers.push(this.finishNode(specifier, "ImportSpecifier"));
  };
  pp$1.parseImportSpecifierDefault = function(id, startPos, startLoc) {
    var node = this.startNodeAt(startPos, startLoc);
    node.local = id;
    this.checkLVal(node.local, true, undefined, "default import specifier");
    return this.finishNode(node, "ImportDefaultSpecifier");
  };
  var pp$2 = Parser.prototype;
  pp$2.toAssignable = function(node, isBinding, contextDescription) {
    if (node) {
      switch (node.type) {
        case "Identifier":
        case "ObjectPattern":
        case "ArrayPattern":
        case "AssignmentPattern":
          break;
        case "ObjectExpression":
          node.type = "ObjectPattern";
          for (var _iterator = node.properties, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();; ) {
            var _ref;
            if (_isArray) {
              if (_i >= _iterator.length)
                break;
              _ref = _iterator[_i++];
            } else {
              _i = _iterator.next();
              if (_i.done)
                break;
              _ref = _i.value;
            }
            var prop = _ref;
            if (prop.type === "ObjectMethod") {
              if (prop.kind === "get" || prop.kind === "set") {
                this.raise(prop.key.start, "Object pattern can't contain getter or setter");
              } else {
                this.raise(prop.key.start, "Object pattern can't contain methods");
              }
            } else {
              this.toAssignable(prop, isBinding, "object destructuring pattern");
            }
          }
          break;
        case "ObjectProperty":
          this.toAssignable(node.value, isBinding, contextDescription);
          break;
        case "SpreadProperty":
          node.type = "RestProperty";
          var arg = node.argument;
          this.toAssignable(arg, isBinding, contextDescription);
          break;
        case "ArrayExpression":
          node.type = "ArrayPattern";
          this.toAssignableList(node.elements, isBinding, contextDescription);
          break;
        case "AssignmentExpression":
          if (node.operator === "=") {
            node.type = "AssignmentPattern";
            delete node.operator;
          } else {
            this.raise(node.left.end, "Only '=' operator can be used for specifying default value.");
          }
          break;
        case "MemberExpression":
          if (!isBinding)
            break;
        default: {
          var message = "Invalid left-hand side" + (contextDescription ? " in " + contextDescription : "expression");
          this.raise(node.start, message);
        }
      }
    }
    return node;
  };
  pp$2.toAssignableList = function(exprList, isBinding, contextDescription) {
    var end = exprList.length;
    if (end) {
      var last2 = exprList[end - 1];
      if (last2 && last2.type === "RestElement") {
        --end;
      } else if (last2 && last2.type === "SpreadElement") {
        last2.type = "RestElement";
        var arg = last2.argument;
        this.toAssignable(arg, isBinding, contextDescription);
        if (arg.type !== "Identifier" && arg.type !== "MemberExpression" && arg.type !== "ArrayPattern") {
          this.unexpected(arg.start);
        }
        --end;
      }
    }
    for (var i = 0;i < end; i++) {
      var elt = exprList[i];
      if (elt)
        this.toAssignable(elt, isBinding, contextDescription);
    }
    return exprList;
  };
  pp$2.toReferencedList = function(exprList) {
    return exprList;
  };
  pp$2.parseSpread = function(refShorthandDefaultPos) {
    var node = this.startNode();
    this.next();
    node.argument = this.parseMaybeAssign(false, refShorthandDefaultPos);
    return this.finishNode(node, "SpreadElement");
  };
  pp$2.parseRest = function() {
    var node = this.startNode();
    this.next();
    node.argument = this.parseBindingIdentifier();
    return this.finishNode(node, "RestElement");
  };
  pp$2.shouldAllowYieldIdentifier = function() {
    return this.match(types2._yield) && !this.state.strict && !this.state.inGenerator;
  };
  pp$2.parseBindingIdentifier = function() {
    return this.parseIdentifier(this.shouldAllowYieldIdentifier());
  };
  pp$2.parseBindingAtom = function() {
    switch (this.state.type) {
      case types2._yield:
        if (this.state.strict || this.state.inGenerator)
          this.unexpected();
      case types2.name:
        return this.parseIdentifier(true);
      case types2.bracketL:
        var node = this.startNode();
        this.next();
        node.elements = this.parseBindingList(types2.bracketR, true);
        return this.finishNode(node, "ArrayPattern");
      case types2.braceL:
        return this.parseObj(true);
      default:
        this.unexpected();
    }
  };
  pp$2.parseBindingList = function(close, allowEmpty) {
    var elts = [];
    var first = true;
    while (!this.eat(close)) {
      if (first) {
        first = false;
      } else {
        this.expect(types2.comma);
      }
      if (allowEmpty && this.match(types2.comma)) {
        elts.push(null);
      } else if (this.eat(close)) {
        break;
      } else if (this.match(types2.ellipsis)) {
        elts.push(this.parseAssignableListItemTypes(this.parseRest()));
        this.expect(close);
        break;
      } else {
        var decorators = [];
        while (this.match(types2.at)) {
          decorators.push(this.parseDecorator());
        }
        var left = this.parseMaybeDefault();
        if (decorators.length) {
          left.decorators = decorators;
        }
        this.parseAssignableListItemTypes(left);
        elts.push(this.parseMaybeDefault(left.start, left.loc.start, left));
      }
    }
    return elts;
  };
  pp$2.parseAssignableListItemTypes = function(param) {
    return param;
  };
  pp$2.parseMaybeDefault = function(startPos, startLoc, left) {
    startLoc = startLoc || this.state.startLoc;
    startPos = startPos || this.state.start;
    left = left || this.parseBindingAtom();
    if (!this.eat(types2.eq))
      return left;
    var node = this.startNodeAt(startPos, startLoc);
    node.left = left;
    node.right = this.parseMaybeAssign();
    return this.finishNode(node, "AssignmentPattern");
  };
  pp$2.checkLVal = function(expr, isBinding, checkClashes, contextDescription) {
    switch (expr.type) {
      case "Identifier":
        this.checkReservedWord(expr.name, expr.start, false, true);
        if (checkClashes) {
          var key = "_" + expr.name;
          if (checkClashes[key]) {
            this.raise(expr.start, "Argument name clash in strict mode");
          } else {
            checkClashes[key] = true;
          }
        }
        break;
      case "MemberExpression":
        if (isBinding)
          this.raise(expr.start, (isBinding ? "Binding" : "Assigning to") + " member expression");
        break;
      case "ObjectPattern":
        for (var _iterator2 = expr.properties, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();; ) {
          var _ref2;
          if (_isArray2) {
            if (_i2 >= _iterator2.length)
              break;
            _ref2 = _iterator2[_i2++];
          } else {
            _i2 = _iterator2.next();
            if (_i2.done)
              break;
            _ref2 = _i2.value;
          }
          var prop = _ref2;
          if (prop.type === "ObjectProperty")
            prop = prop.value;
          this.checkLVal(prop, isBinding, checkClashes, "object destructuring pattern");
        }
        break;
      case "ArrayPattern":
        for (var _iterator3 = expr.elements, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();; ) {
          var _ref3;
          if (_isArray3) {
            if (_i3 >= _iterator3.length)
              break;
            _ref3 = _iterator3[_i3++];
          } else {
            _i3 = _iterator3.next();
            if (_i3.done)
              break;
            _ref3 = _i3.value;
          }
          var elem = _ref3;
          if (elem)
            this.checkLVal(elem, isBinding, checkClashes, "array destructuring pattern");
        }
        break;
      case "AssignmentPattern":
        this.checkLVal(expr.left, isBinding, checkClashes, "assignment pattern");
        break;
      case "RestProperty":
        this.checkLVal(expr.argument, isBinding, checkClashes, "rest property");
        break;
      case "RestElement":
        this.checkLVal(expr.argument, isBinding, checkClashes, "rest element");
        break;
      default: {
        var message = (isBinding ? "Binding invalid" : "Invalid") + " left-hand side" + (contextDescription ? " in " + contextDescription : "expression");
        this.raise(expr.start, message);
      }
    }
  };
  var pp$3 = Parser.prototype;
  pp$3.checkPropClash = function(prop, propHash) {
    if (prop.computed || prop.kind)
      return;
    var key = prop.key;
    var name = key.type === "Identifier" ? key.name : String(key.value);
    if (name === "__proto__") {
      if (propHash.proto)
        this.raise(key.start, "Redefinition of __proto__ property");
      propHash.proto = true;
    }
  };
  pp$3.getExpression = function() {
    this.nextToken();
    var expr = this.parseExpression();
    if (!this.match(types2.eof)) {
      this.unexpected();
    }
    return expr;
  };
  pp$3.parseExpression = function(noIn, refShorthandDefaultPos) {
    var startPos = this.state.start;
    var startLoc = this.state.startLoc;
    var expr = this.parseMaybeAssign(noIn, refShorthandDefaultPos);
    if (this.match(types2.comma)) {
      var node = this.startNodeAt(startPos, startLoc);
      node.expressions = [expr];
      while (this.eat(types2.comma)) {
        node.expressions.push(this.parseMaybeAssign(noIn, refShorthandDefaultPos));
      }
      this.toReferencedList(node.expressions);
      return this.finishNode(node, "SequenceExpression");
    }
    return expr;
  };
  pp$3.parseMaybeAssign = function(noIn, refShorthandDefaultPos, afterLeftParse, refNeedsArrowPos) {
    var startPos = this.state.start;
    var startLoc = this.state.startLoc;
    if (this.match(types2._yield) && this.state.inGenerator) {
      var _left = this.parseYield();
      if (afterLeftParse)
        _left = afterLeftParse.call(this, _left, startPos, startLoc);
      return _left;
    }
    var failOnShorthandAssign = undefined;
    if (refShorthandDefaultPos) {
      failOnShorthandAssign = false;
    } else {
      refShorthandDefaultPos = { start: 0 };
      failOnShorthandAssign = true;
    }
    if (this.match(types2.parenL) || this.match(types2.name)) {
      this.state.potentialArrowAt = this.state.start;
    }
    var left = this.parseMaybeConditional(noIn, refShorthandDefaultPos, refNeedsArrowPos);
    if (afterLeftParse)
      left = afterLeftParse.call(this, left, startPos, startLoc);
    if (this.state.type.isAssign) {
      var node = this.startNodeAt(startPos, startLoc);
      node.operator = this.state.value;
      node.left = this.match(types2.eq) ? this.toAssignable(left, undefined, "assignment expression") : left;
      refShorthandDefaultPos.start = 0;
      this.checkLVal(left, undefined, undefined, "assignment expression");
      if (left.extra && left.extra.parenthesized) {
        var errorMsg = undefined;
        if (left.type === "ObjectPattern") {
          errorMsg = "`({a}) = 0` use `({a} = 0)`";
        } else if (left.type === "ArrayPattern") {
          errorMsg = "`([a]) = 0` use `([a] = 0)`";
        }
        if (errorMsg) {
          this.raise(left.start, "You're trying to assign to a parenthesized expression, eg. instead of " + errorMsg);
        }
      }
      this.next();
      node.right = this.parseMaybeAssign(noIn);
      return this.finishNode(node, "AssignmentExpression");
    } else if (failOnShorthandAssign && refShorthandDefaultPos.start) {
      this.unexpected(refShorthandDefaultPos.start);
    }
    return left;
  };
  pp$3.parseMaybeConditional = function(noIn, refShorthandDefaultPos, refNeedsArrowPos) {
    var startPos = this.state.start;
    var startLoc = this.state.startLoc;
    var expr = this.parseExprOps(noIn, refShorthandDefaultPos);
    if (refShorthandDefaultPos && refShorthandDefaultPos.start)
      return expr;
    return this.parseConditional(expr, noIn, startPos, startLoc, refNeedsArrowPos);
  };
  pp$3.parseConditional = function(expr, noIn, startPos, startLoc) {
    if (this.eat(types2.question)) {
      var node = this.startNodeAt(startPos, startLoc);
      node.test = expr;
      node.consequent = this.parseMaybeAssign();
      this.expect(types2.colon);
      node.alternate = this.parseMaybeAssign(noIn);
      return this.finishNode(node, "ConditionalExpression");
    }
    return expr;
  };
  pp$3.parseExprOps = function(noIn, refShorthandDefaultPos) {
    var startPos = this.state.start;
    var startLoc = this.state.startLoc;
    var expr = this.parseMaybeUnary(refShorthandDefaultPos);
    if (refShorthandDefaultPos && refShorthandDefaultPos.start) {
      return expr;
    } else {
      return this.parseExprOp(expr, startPos, startLoc, -1, noIn);
    }
  };
  pp$3.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, noIn) {
    var prec = this.state.type.binop;
    if (prec != null && (!noIn || !this.match(types2._in))) {
      if (prec > minPrec) {
        var node = this.startNodeAt(leftStartPos, leftStartLoc);
        node.left = left;
        node.operator = this.state.value;
        if (node.operator === "**" && left.type === "UnaryExpression" && left.extra && !left.extra.parenthesizedArgument && !left.extra.parenthesized) {
          this.raise(left.argument.start, "Illegal expression. Wrap left hand side or entire exponentiation in parentheses.");
        }
        var op = this.state.type;
        this.next();
        var startPos = this.state.start;
        var startLoc = this.state.startLoc;
        node.right = this.parseExprOp(this.parseMaybeUnary(), startPos, startLoc, op.rightAssociative ? prec - 1 : prec, noIn);
        this.finishNode(node, op === types2.logicalOR || op === types2.logicalAND ? "LogicalExpression" : "BinaryExpression");
        return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, noIn);
      }
    }
    return left;
  };
  pp$3.parseMaybeUnary = function(refShorthandDefaultPos) {
    if (this.state.type.prefix) {
      var node = this.startNode();
      var update = this.match(types2.incDec);
      node.operator = this.state.value;
      node.prefix = true;
      this.next();
      var argType = this.state.type;
      node.argument = this.parseMaybeUnary();
      this.addExtra(node, "parenthesizedArgument", argType === types2.parenL && (!node.argument.extra || !node.argument.extra.parenthesized));
      if (refShorthandDefaultPos && refShorthandDefaultPos.start) {
        this.unexpected(refShorthandDefaultPos.start);
      }
      if (update) {
        this.checkLVal(node.argument, undefined, undefined, "prefix operation");
      } else if (this.state.strict && node.operator === "delete" && node.argument.type === "Identifier") {
        this.raise(node.start, "Deleting local variable in strict mode");
      }
      return this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
    }
    var startPos = this.state.start;
    var startLoc = this.state.startLoc;
    var expr = this.parseExprSubscripts(refShorthandDefaultPos);
    if (refShorthandDefaultPos && refShorthandDefaultPos.start)
      return expr;
    while (this.state.type.postfix && !this.canInsertSemicolon()) {
      var _node = this.startNodeAt(startPos, startLoc);
      _node.operator = this.state.value;
      _node.prefix = false;
      _node.argument = expr;
      this.checkLVal(expr, undefined, undefined, "postfix operation");
      this.next();
      expr = this.finishNode(_node, "UpdateExpression");
    }
    return expr;
  };
  pp$3.parseExprSubscripts = function(refShorthandDefaultPos) {
    var startPos = this.state.start;
    var startLoc = this.state.startLoc;
    var potentialArrowAt = this.state.potentialArrowAt;
    var expr = this.parseExprAtom(refShorthandDefaultPos);
    if (expr.type === "ArrowFunctionExpression" && expr.start === potentialArrowAt) {
      return expr;
    }
    if (refShorthandDefaultPos && refShorthandDefaultPos.start) {
      return expr;
    }
    return this.parseSubscripts(expr, startPos, startLoc);
  };
  pp$3.parseSubscripts = function(base, startPos, startLoc, noCalls) {
    for (;; ) {
      if (!noCalls && this.eat(types2.doubleColon)) {
        var node = this.startNodeAt(startPos, startLoc);
        node.object = base;
        node.callee = this.parseNoCallExpr();
        return this.parseSubscripts(this.finishNode(node, "BindExpression"), startPos, startLoc, noCalls);
      } else if (this.eat(types2.dot)) {
        var _node2 = this.startNodeAt(startPos, startLoc);
        _node2.object = base;
        _node2.property = this.parseIdentifier(true);
        _node2.computed = false;
        base = this.finishNode(_node2, "MemberExpression");
      } else if (this.eat(types2.bracketL)) {
        var _node3 = this.startNodeAt(startPos, startLoc);
        _node3.object = base;
        _node3.property = this.parseExpression();
        _node3.computed = true;
        this.expect(types2.bracketR);
        base = this.finishNode(_node3, "MemberExpression");
      } else if (!noCalls && this.match(types2.parenL)) {
        var possibleAsync = this.state.potentialArrowAt === base.start && base.type === "Identifier" && base.name === "async" && !this.canInsertSemicolon();
        this.next();
        var _node4 = this.startNodeAt(startPos, startLoc);
        _node4.callee = base;
        _node4.arguments = this.parseCallExpressionArguments(types2.parenR, possibleAsync);
        if (_node4.callee.type === "Import" && _node4.arguments.length !== 1) {
          this.raise(_node4.start, "import() requires exactly one argument");
        }
        base = this.finishNode(_node4, "CallExpression");
        if (possibleAsync && this.shouldParseAsyncArrow()) {
          return this.parseAsyncArrowFromCallExpression(this.startNodeAt(startPos, startLoc), _node4);
        } else {
          this.toReferencedList(_node4.arguments);
        }
      } else if (this.match(types2.backQuote)) {
        var _node5 = this.startNodeAt(startPos, startLoc);
        _node5.tag = base;
        _node5.quasi = this.parseTemplate(true);
        base = this.finishNode(_node5, "TaggedTemplateExpression");
      } else {
        return base;
      }
    }
  };
  pp$3.parseCallExpressionArguments = function(close, possibleAsyncArrow) {
    var elts = [];
    var innerParenStart = undefined;
    var first = true;
    while (!this.eat(close)) {
      if (first) {
        first = false;
      } else {
        this.expect(types2.comma);
        if (this.eat(close))
          break;
      }
      if (this.match(types2.parenL) && !innerParenStart) {
        innerParenStart = this.state.start;
      }
      elts.push(this.parseExprListItem(false, possibleAsyncArrow ? { start: 0 } : undefined, possibleAsyncArrow ? { start: 0 } : undefined));
    }
    if (possibleAsyncArrow && innerParenStart && this.shouldParseAsyncArrow()) {
      this.unexpected();
    }
    return elts;
  };
  pp$3.shouldParseAsyncArrow = function() {
    return this.match(types2.arrow);
  };
  pp$3.parseAsyncArrowFromCallExpression = function(node, call) {
    this.expect(types2.arrow);
    return this.parseArrowExpression(node, call.arguments, true);
  };
  pp$3.parseNoCallExpr = function() {
    var startPos = this.state.start;
    var startLoc = this.state.startLoc;
    return this.parseSubscripts(this.parseExprAtom(), startPos, startLoc, true);
  };
  pp$3.parseExprAtom = function(refShorthandDefaultPos) {
    var canBeArrow = this.state.potentialArrowAt === this.state.start;
    var node = undefined;
    switch (this.state.type) {
      case types2._super:
        if (!this.state.inMethod && !this.state.inClassProperty && !this.options.allowSuperOutsideMethod) {
          this.raise(this.state.start, "'super' outside of function or class");
        }
        node = this.startNode();
        this.next();
        if (!this.match(types2.parenL) && !this.match(types2.bracketL) && !this.match(types2.dot)) {
          this.unexpected();
        }
        if (this.match(types2.parenL) && this.state.inMethod !== "constructor" && !this.options.allowSuperOutsideMethod) {
          this.raise(node.start, "super() outside of class constructor");
        }
        return this.finishNode(node, "Super");
      case types2._import:
        if (!this.hasPlugin("dynamicImport"))
          this.unexpected();
        node = this.startNode();
        this.next();
        if (!this.match(types2.parenL)) {
          this.unexpected(null, types2.parenL);
        }
        return this.finishNode(node, "Import");
      case types2._this:
        node = this.startNode();
        this.next();
        return this.finishNode(node, "ThisExpression");
      case types2._yield:
        if (this.state.inGenerator)
          this.unexpected();
      case types2.name:
        node = this.startNode();
        var allowAwait = this.state.value === "await" && this.state.inAsync;
        var allowYield = this.shouldAllowYieldIdentifier();
        var id = this.parseIdentifier(allowAwait || allowYield);
        if (id.name === "await") {
          if (this.state.inAsync || this.inModule) {
            return this.parseAwait(node);
          }
        } else if (id.name === "async" && this.match(types2._function) && !this.canInsertSemicolon()) {
          this.next();
          return this.parseFunction(node, false, false, true);
        } else if (canBeArrow && id.name === "async" && this.match(types2.name)) {
          var params = [this.parseIdentifier()];
          this.expect(types2.arrow);
          return this.parseArrowExpression(node, params, true);
        }
        if (canBeArrow && !this.canInsertSemicolon() && this.eat(types2.arrow)) {
          return this.parseArrowExpression(node, [id]);
        }
        return id;
      case types2._do:
        if (this.hasPlugin("doExpressions")) {
          var _node6 = this.startNode();
          this.next();
          var oldInFunction = this.state.inFunction;
          var oldLabels = this.state.labels;
          this.state.labels = [];
          this.state.inFunction = false;
          _node6.body = this.parseBlock(false, true);
          this.state.inFunction = oldInFunction;
          this.state.labels = oldLabels;
          return this.finishNode(_node6, "DoExpression");
        }
      case types2.regexp:
        var value = this.state.value;
        node = this.parseLiteral(value.value, "RegExpLiteral");
        node.pattern = value.pattern;
        node.flags = value.flags;
        return node;
      case types2.num:
        return this.parseLiteral(this.state.value, "NumericLiteral");
      case types2.string:
        return this.parseLiteral(this.state.value, "StringLiteral");
      case types2._null:
        node = this.startNode();
        this.next();
        return this.finishNode(node, "NullLiteral");
      case types2._true:
      case types2._false:
        node = this.startNode();
        node.value = this.match(types2._true);
        this.next();
        return this.finishNode(node, "BooleanLiteral");
      case types2.parenL:
        return this.parseParenAndDistinguishExpression(null, null, canBeArrow);
      case types2.bracketL:
        node = this.startNode();
        this.next();
        node.elements = this.parseExprList(types2.bracketR, true, refShorthandDefaultPos);
        this.toReferencedList(node.elements);
        return this.finishNode(node, "ArrayExpression");
      case types2.braceL:
        return this.parseObj(false, refShorthandDefaultPos);
      case types2._function:
        return this.parseFunctionExpression();
      case types2.at:
        this.parseDecorators();
      case types2._class:
        node = this.startNode();
        this.takeDecorators(node);
        return this.parseClass(node, false);
      case types2._new:
        return this.parseNew();
      case types2.backQuote:
        return this.parseTemplate(false);
      case types2.doubleColon:
        node = this.startNode();
        this.next();
        node.object = null;
        var callee = node.callee = this.parseNoCallExpr();
        if (callee.type === "MemberExpression") {
          return this.finishNode(node, "BindExpression");
        } else {
          this.raise(callee.start, "Binding should be performed on object property.");
        }
      default:
        this.unexpected();
    }
  };
  pp$3.parseFunctionExpression = function() {
    var node = this.startNode();
    var meta = this.parseIdentifier(true);
    if (this.state.inGenerator && this.eat(types2.dot) && this.hasPlugin("functionSent")) {
      return this.parseMetaProperty(node, meta, "sent");
    } else {
      return this.parseFunction(node, false);
    }
  };
  pp$3.parseMetaProperty = function(node, meta, propertyName) {
    node.meta = meta;
    node.property = this.parseIdentifier(true);
    if (node.property.name !== propertyName) {
      this.raise(node.property.start, "The only valid meta property for new is " + meta.name + "." + propertyName);
    }
    return this.finishNode(node, "MetaProperty");
  };
  pp$3.parseLiteral = function(value, type, startPos, startLoc) {
    startPos = startPos || this.state.start;
    startLoc = startLoc || this.state.startLoc;
    var node = this.startNodeAt(startPos, startLoc);
    this.addExtra(node, "rawValue", value);
    this.addExtra(node, "raw", this.input.slice(startPos, this.state.end));
    node.value = value;
    this.next();
    return this.finishNode(node, type);
  };
  pp$3.parseParenExpression = function() {
    this.expect(types2.parenL);
    var val = this.parseExpression();
    this.expect(types2.parenR);
    return val;
  };
  pp$3.parseParenAndDistinguishExpression = function(startPos, startLoc, canBeArrow) {
    startPos = startPos || this.state.start;
    startLoc = startLoc || this.state.startLoc;
    var val = undefined;
    this.expect(types2.parenL);
    var innerStartPos = this.state.start;
    var innerStartLoc = this.state.startLoc;
    var exprList = [];
    var refShorthandDefaultPos = { start: 0 };
    var refNeedsArrowPos = { start: 0 };
    var first = true;
    var spreadStart = undefined;
    var optionalCommaStart = undefined;
    while (!this.match(types2.parenR)) {
      if (first) {
        first = false;
      } else {
        this.expect(types2.comma, refNeedsArrowPos.start || null);
        if (this.match(types2.parenR)) {
          optionalCommaStart = this.state.start;
          break;
        }
      }
      if (this.match(types2.ellipsis)) {
        var spreadNodeStartPos = this.state.start;
        var spreadNodeStartLoc = this.state.startLoc;
        spreadStart = this.state.start;
        exprList.push(this.parseParenItem(this.parseRest(), spreadNodeStartPos, spreadNodeStartLoc));
        break;
      } else {
        exprList.push(this.parseMaybeAssign(false, refShorthandDefaultPos, this.parseParenItem, refNeedsArrowPos));
      }
    }
    var innerEndPos = this.state.start;
    var innerEndLoc = this.state.startLoc;
    this.expect(types2.parenR);
    var arrowNode = this.startNodeAt(startPos, startLoc);
    if (canBeArrow && this.shouldParseArrow() && (arrowNode = this.parseArrow(arrowNode))) {
      for (var _iterator = exprList, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();; ) {
        var _ref;
        if (_isArray) {
          if (_i >= _iterator.length)
            break;
          _ref = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done)
            break;
          _ref = _i.value;
        }
        var param = _ref;
        if (param.extra && param.extra.parenthesized)
          this.unexpected(param.extra.parenStart);
      }
      return this.parseArrowExpression(arrowNode, exprList);
    }
    if (!exprList.length) {
      this.unexpected(this.state.lastTokStart);
    }
    if (optionalCommaStart)
      this.unexpected(optionalCommaStart);
    if (spreadStart)
      this.unexpected(spreadStart);
    if (refShorthandDefaultPos.start)
      this.unexpected(refShorthandDefaultPos.start);
    if (refNeedsArrowPos.start)
      this.unexpected(refNeedsArrowPos.start);
    if (exprList.length > 1) {
      val = this.startNodeAt(innerStartPos, innerStartLoc);
      val.expressions = exprList;
      this.toReferencedList(val.expressions);
      this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
    } else {
      val = exprList[0];
    }
    this.addExtra(val, "parenthesized", true);
    this.addExtra(val, "parenStart", startPos);
    return val;
  };
  pp$3.shouldParseArrow = function() {
    return !this.canInsertSemicolon();
  };
  pp$3.parseArrow = function(node) {
    if (this.eat(types2.arrow)) {
      return node;
    }
  };
  pp$3.parseParenItem = function(node) {
    return node;
  };
  pp$3.parseNew = function() {
    var node = this.startNode();
    var meta = this.parseIdentifier(true);
    if (this.eat(types2.dot)) {
      var metaProp = this.parseMetaProperty(node, meta, "target");
      if (!this.state.inFunction) {
        this.raise(metaProp.property.start, "new.target can only be used in functions");
      }
      return metaProp;
    }
    node.callee = this.parseNoCallExpr();
    if (this.eat(types2.parenL)) {
      node.arguments = this.parseExprList(types2.parenR);
      this.toReferencedList(node.arguments);
    } else {
      node.arguments = [];
    }
    return this.finishNode(node, "NewExpression");
  };
  pp$3.parseTemplateElement = function(isTagged) {
    var elem = this.startNode();
    if (this.state.value === null) {
      if (!isTagged || !this.hasPlugin("templateInvalidEscapes")) {
        this.raise(this.state.invalidTemplateEscapePosition, "Invalid escape sequence in template");
      } else {
        this.state.invalidTemplateEscapePosition = null;
      }
    }
    elem.value = {
      raw: this.input.slice(this.state.start, this.state.end).replace(/\r\n?/g, `
`),
      cooked: this.state.value
    };
    this.next();
    elem.tail = this.match(types2.backQuote);
    return this.finishNode(elem, "TemplateElement");
  };
  pp$3.parseTemplate = function(isTagged) {
    var node = this.startNode();
    this.next();
    node.expressions = [];
    var curElt = this.parseTemplateElement(isTagged);
    node.quasis = [curElt];
    while (!curElt.tail) {
      this.expect(types2.dollarBraceL);
      node.expressions.push(this.parseExpression());
      this.expect(types2.braceR);
      node.quasis.push(curElt = this.parseTemplateElement(isTagged));
    }
    this.next();
    return this.finishNode(node, "TemplateLiteral");
  };
  pp$3.parseObj = function(isPattern, refShorthandDefaultPos) {
    var decorators = [];
    var propHash = Object.create(null);
    var first = true;
    var node = this.startNode();
    node.properties = [];
    this.next();
    var firstRestLocation = null;
    while (!this.eat(types2.braceR)) {
      if (first) {
        first = false;
      } else {
        this.expect(types2.comma);
        if (this.eat(types2.braceR))
          break;
      }
      while (this.match(types2.at)) {
        decorators.push(this.parseDecorator());
      }
      var prop = this.startNode(), isGenerator = false, isAsync2 = false, startPos = undefined, startLoc = undefined;
      if (decorators.length) {
        prop.decorators = decorators;
        decorators = [];
      }
      if (this.hasPlugin("objectRestSpread") && this.match(types2.ellipsis)) {
        prop = this.parseSpread(isPattern ? { start: 0 } : undefined);
        prop.type = isPattern ? "RestProperty" : "SpreadProperty";
        if (isPattern)
          this.toAssignable(prop.argument, true, "object pattern");
        node.properties.push(prop);
        if (isPattern) {
          var position = this.state.start;
          if (firstRestLocation !== null) {
            this.unexpected(firstRestLocation, "Cannot have multiple rest elements when destructuring");
          } else if (this.eat(types2.braceR)) {
            break;
          } else if (this.match(types2.comma) && this.lookahead().type === types2.braceR) {
            continue;
          } else {
            firstRestLocation = position;
            continue;
          }
        } else {
          continue;
        }
      }
      prop.method = false;
      prop.shorthand = false;
      if (isPattern || refShorthandDefaultPos) {
        startPos = this.state.start;
        startLoc = this.state.startLoc;
      }
      if (!isPattern) {
        isGenerator = this.eat(types2.star);
      }
      if (!isPattern && this.isContextual("async")) {
        if (isGenerator)
          this.unexpected();
        var asyncId = this.parseIdentifier();
        if (this.match(types2.colon) || this.match(types2.parenL) || this.match(types2.braceR) || this.match(types2.eq) || this.match(types2.comma)) {
          prop.key = asyncId;
          prop.computed = false;
        } else {
          isAsync2 = true;
          if (this.hasPlugin("asyncGenerators"))
            isGenerator = this.eat(types2.star);
          this.parsePropertyName(prop);
        }
      } else {
        this.parsePropertyName(prop);
      }
      this.parseObjPropValue(prop, startPos, startLoc, isGenerator, isAsync2, isPattern, refShorthandDefaultPos);
      this.checkPropClash(prop, propHash);
      if (prop.shorthand) {
        this.addExtra(prop, "shorthand", true);
      }
      node.properties.push(prop);
    }
    if (firstRestLocation !== null) {
      this.unexpected(firstRestLocation, "The rest element has to be the last element when destructuring");
    }
    if (decorators.length) {
      this.raise(this.state.start, "You have trailing decorators with no property");
    }
    return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression");
  };
  pp$3.isGetterOrSetterMethod = function(prop, isPattern) {
    return !isPattern && !prop.computed && prop.key.type === "Identifier" && (prop.key.name === "get" || prop.key.name === "set") && (this.match(types2.string) || this.match(types2.num) || this.match(types2.bracketL) || this.match(types2.name) || this.state.type.keyword);
  };
  pp$3.checkGetterSetterParamCount = function(method) {
    var paramCount = method.kind === "get" ? 0 : 1;
    if (method.params.length !== paramCount) {
      var start = method.start;
      if (method.kind === "get") {
        this.raise(start, "getter should have no params");
      } else {
        this.raise(start, "setter should have exactly one param");
      }
    }
  };
  pp$3.parseObjectMethod = function(prop, isGenerator, isAsync2, isPattern) {
    if (isAsync2 || isGenerator || this.match(types2.parenL)) {
      if (isPattern)
        this.unexpected();
      prop.kind = "method";
      prop.method = true;
      this.parseMethod(prop, isGenerator, isAsync2);
      return this.finishNode(prop, "ObjectMethod");
    }
    if (this.isGetterOrSetterMethod(prop, isPattern)) {
      if (isGenerator || isAsync2)
        this.unexpected();
      prop.kind = prop.key.name;
      this.parsePropertyName(prop);
      this.parseMethod(prop);
      this.checkGetterSetterParamCount(prop);
      return this.finishNode(prop, "ObjectMethod");
    }
  };
  pp$3.parseObjectProperty = function(prop, startPos, startLoc, isPattern, refShorthandDefaultPos) {
    if (this.eat(types2.colon)) {
      prop.value = isPattern ? this.parseMaybeDefault(this.state.start, this.state.startLoc) : this.parseMaybeAssign(false, refShorthandDefaultPos);
      return this.finishNode(prop, "ObjectProperty");
    }
    if (!prop.computed && prop.key.type === "Identifier") {
      this.checkReservedWord(prop.key.name, prop.key.start, true, true);
      if (isPattern) {
        prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key.__clone());
      } else if (this.match(types2.eq) && refShorthandDefaultPos) {
        if (!refShorthandDefaultPos.start) {
          refShorthandDefaultPos.start = this.state.start;
        }
        prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key.__clone());
      } else {
        prop.value = prop.key.__clone();
      }
      prop.shorthand = true;
      return this.finishNode(prop, "ObjectProperty");
    }
  };
  pp$3.parseObjPropValue = function(prop, startPos, startLoc, isGenerator, isAsync2, isPattern, refShorthandDefaultPos) {
    var node = this.parseObjectMethod(prop, isGenerator, isAsync2, isPattern) || this.parseObjectProperty(prop, startPos, startLoc, isPattern, refShorthandDefaultPos);
    if (!node)
      this.unexpected();
    return node;
  };
  pp$3.parsePropertyName = function(prop) {
    if (this.eat(types2.bracketL)) {
      prop.computed = true;
      prop.key = this.parseMaybeAssign();
      this.expect(types2.bracketR);
    } else {
      prop.computed = false;
      var oldInPropertyName = this.state.inPropertyName;
      this.state.inPropertyName = true;
      prop.key = this.match(types2.num) || this.match(types2.string) ? this.parseExprAtom() : this.parseIdentifier(true);
      this.state.inPropertyName = oldInPropertyName;
    }
    return prop.key;
  };
  pp$3.initFunction = function(node, isAsync2) {
    node.id = null;
    node.generator = false;
    node.expression = false;
    node.async = !!isAsync2;
  };
  pp$3.parseMethod = function(node, isGenerator, isAsync2) {
    var oldInMethod = this.state.inMethod;
    this.state.inMethod = node.kind || true;
    this.initFunction(node, isAsync2);
    this.expect(types2.parenL);
    node.params = this.parseBindingList(types2.parenR);
    node.generator = !!isGenerator;
    this.parseFunctionBody(node);
    this.state.inMethod = oldInMethod;
    return node;
  };
  pp$3.parseArrowExpression = function(node, params, isAsync2) {
    this.initFunction(node, isAsync2);
    node.params = this.toAssignableList(params, true, "arrow function parameters");
    this.parseFunctionBody(node, true);
    return this.finishNode(node, "ArrowFunctionExpression");
  };
  pp$3.isStrictBody = function(node, isExpression) {
    if (!isExpression && node.body.directives.length) {
      for (var _iterator2 = node.body.directives, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();; ) {
        var _ref2;
        if (_isArray2) {
          if (_i2 >= _iterator2.length)
            break;
          _ref2 = _iterator2[_i2++];
        } else {
          _i2 = _iterator2.next();
          if (_i2.done)
            break;
          _ref2 = _i2.value;
        }
        var directive = _ref2;
        if (directive.value.value === "use strict") {
          return true;
        }
      }
    }
    return false;
  };
  pp$3.parseFunctionBody = function(node, allowExpression) {
    var isExpression = allowExpression && !this.match(types2.braceL);
    var oldInAsync = this.state.inAsync;
    this.state.inAsync = node.async;
    if (isExpression) {
      node.body = this.parseMaybeAssign();
      node.expression = true;
    } else {
      var oldInFunc = this.state.inFunction;
      var oldInGen = this.state.inGenerator;
      var oldLabels = this.state.labels;
      this.state.inFunction = true;
      this.state.inGenerator = node.generator;
      this.state.labels = [];
      node.body = this.parseBlock(true);
      node.expression = false;
      this.state.inFunction = oldInFunc;
      this.state.inGenerator = oldInGen;
      this.state.labels = oldLabels;
    }
    this.state.inAsync = oldInAsync;
    var isStrict = this.isStrictBody(node, isExpression);
    var checkLVal = this.state.strict || allowExpression || isStrict;
    if (isStrict && node.id && node.id.type === "Identifier" && node.id.name === "yield") {
      this.raise(node.id.start, "Binding yield in strict mode");
    }
    if (checkLVal) {
      var nameHash = Object.create(null);
      var oldStrict = this.state.strict;
      if (isStrict)
        this.state.strict = true;
      if (node.id) {
        this.checkLVal(node.id, true, undefined, "function name");
      }
      for (var _iterator3 = node.params, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();; ) {
        var _ref3;
        if (_isArray3) {
          if (_i3 >= _iterator3.length)
            break;
          _ref3 = _iterator3[_i3++];
        } else {
          _i3 = _iterator3.next();
          if (_i3.done)
            break;
          _ref3 = _i3.value;
        }
        var param = _ref3;
        if (isStrict && param.type !== "Identifier") {
          this.raise(param.start, "Non-simple parameter in strict mode");
        }
        this.checkLVal(param, true, nameHash, "function parameter list");
      }
      this.state.strict = oldStrict;
    }
  };
  pp$3.parseExprList = function(close, allowEmpty, refShorthandDefaultPos) {
    var elts = [];
    var first = true;
    while (!this.eat(close)) {
      if (first) {
        first = false;
      } else {
        this.expect(types2.comma);
        if (this.eat(close))
          break;
      }
      elts.push(this.parseExprListItem(allowEmpty, refShorthandDefaultPos));
    }
    return elts;
  };
  pp$3.parseExprListItem = function(allowEmpty, refShorthandDefaultPos, refNeedsArrowPos) {
    var elt = undefined;
    if (allowEmpty && this.match(types2.comma)) {
      elt = null;
    } else if (this.match(types2.ellipsis)) {
      elt = this.parseSpread(refShorthandDefaultPos);
    } else {
      elt = this.parseMaybeAssign(false, refShorthandDefaultPos, this.parseParenItem, refNeedsArrowPos);
    }
    return elt;
  };
  pp$3.parseIdentifier = function(liberal) {
    var node = this.startNode();
    if (!liberal) {
      this.checkReservedWord(this.state.value, this.state.start, !!this.state.type.keyword, false);
    }
    if (this.match(types2.name)) {
      node.name = this.state.value;
    } else if (this.state.type.keyword) {
      node.name = this.state.type.keyword;
    } else {
      this.unexpected();
    }
    if (!liberal && node.name === "await" && this.state.inAsync) {
      this.raise(node.start, "invalid use of await inside of an async function");
    }
    node.loc.identifierName = node.name;
    this.next();
    return this.finishNode(node, "Identifier");
  };
  pp$3.checkReservedWord = function(word, startLoc, checkKeywords, isBinding) {
    if (this.isReservedWord(word) || checkKeywords && this.isKeyword(word)) {
      this.raise(startLoc, word + " is a reserved word");
    }
    if (this.state.strict && (reservedWords.strict(word) || isBinding && reservedWords.strictBind(word))) {
      this.raise(startLoc, word + " is a reserved word in strict mode");
    }
  };
  pp$3.parseAwait = function(node) {
    if (!this.state.inAsync) {
      this.unexpected();
    }
    if (this.match(types2.star)) {
      this.raise(node.start, "await* has been removed from the async functions proposal. Use Promise.all() instead.");
    }
    node.argument = this.parseMaybeUnary();
    return this.finishNode(node, "AwaitExpression");
  };
  pp$3.parseYield = function() {
    var node = this.startNode();
    this.next();
    if (this.match(types2.semi) || this.canInsertSemicolon() || !this.match(types2.star) && !this.state.type.startsExpr) {
      node.delegate = false;
      node.argument = null;
    } else {
      node.delegate = this.eat(types2.star);
      node.argument = this.parseMaybeAssign();
    }
    return this.finishNode(node, "YieldExpression");
  };
  var pp$4 = Parser.prototype;
  var commentKeys = ["leadingComments", "trailingComments", "innerComments"];
  var Node = function() {
    function Node2(pos, loc, filename) {
      classCallCheck(this, Node2);
      this.type = "";
      this.start = pos;
      this.end = 0;
      this.loc = new SourceLocation(loc);
      if (filename)
        this.loc.filename = filename;
    }
    Node2.prototype.__clone = function __clone() {
      var node2 = new Node2;
      for (var key in this) {
        if (commentKeys.indexOf(key) < 0) {
          node2[key] = this[key];
        }
      }
      return node2;
    };
    return Node2;
  }();
  pp$4.startNode = function() {
    return new Node(this.state.start, this.state.startLoc, this.filename);
  };
  pp$4.startNodeAt = function(pos, loc) {
    return new Node(pos, loc, this.filename);
  };
  function finishNodeAt(node, type, pos, loc) {
    node.type = type;
    node.end = pos;
    node.loc.end = loc;
    this.processComment(node);
    return node;
  }
  pp$4.finishNode = function(node, type) {
    return finishNodeAt.call(this, node, type, this.state.lastTokEnd, this.state.lastTokEndLoc);
  };
  pp$4.finishNodeAt = function(node, type, pos, loc) {
    return finishNodeAt.call(this, node, type, pos, loc);
  };
  var pp$5 = Parser.prototype;
  pp$5.raise = function(pos, message) {
    var loc = getLineInfo(this.input, pos);
    message += " (" + loc.line + ":" + loc.column + ")";
    var err = new SyntaxError(message);
    err.pos = pos;
    err.loc = loc;
    throw err;
  };
  function last(stack) {
    return stack[stack.length - 1];
  }
  var pp$6 = Parser.prototype;
  pp$6.addComment = function(comment) {
    if (this.filename)
      comment.loc.filename = this.filename;
    this.state.trailingComments.push(comment);
    this.state.leadingComments.push(comment);
  };
  pp$6.processComment = function(node) {
    if (node.type === "Program" && node.body.length > 0)
      return;
    var stack = this.state.commentStack;
    var firstChild = undefined, lastChild = undefined, trailingComments = undefined, i = undefined, j = undefined;
    if (this.state.trailingComments.length > 0) {
      if (this.state.trailingComments[0].start >= node.end) {
        trailingComments = this.state.trailingComments;
        this.state.trailingComments = [];
      } else {
        this.state.trailingComments.length = 0;
      }
    } else {
      var lastInStack = last(stack);
      if (stack.length > 0 && lastInStack.trailingComments && lastInStack.trailingComments[0].start >= node.end) {
        trailingComments = lastInStack.trailingComments;
        lastInStack.trailingComments = null;
      }
    }
    if (stack.length > 0 && last(stack).start >= node.start) {
      firstChild = stack.pop();
    }
    while (stack.length > 0 && last(stack).start >= node.start) {
      lastChild = stack.pop();
    }
    if (!lastChild && firstChild)
      lastChild = firstChild;
    if (firstChild && this.state.leadingComments.length > 0) {
      var lastComment = last(this.state.leadingComments);
      if (firstChild.type === "ObjectProperty") {
        if (lastComment.start >= node.start) {
          if (this.state.commentPreviousNode) {
            for (j = 0;j < this.state.leadingComments.length; j++) {
              if (this.state.leadingComments[j].end < this.state.commentPreviousNode.end) {
                this.state.leadingComments.splice(j, 1);
                j--;
              }
            }
            if (this.state.leadingComments.length > 0) {
              firstChild.trailingComments = this.state.leadingComments;
              this.state.leadingComments = [];
            }
          }
        }
      } else if (node.type === "CallExpression" && node.arguments && node.arguments.length) {
        var lastArg = last(node.arguments);
        if (lastArg && lastComment.start >= lastArg.start && lastComment.end <= node.end) {
          if (this.state.commentPreviousNode) {
            if (this.state.leadingComments.length > 0) {
              lastArg.trailingComments = this.state.leadingComments;
              this.state.leadingComments = [];
            }
          }
        }
      }
    }
    if (lastChild) {
      if (lastChild.leadingComments) {
        if (lastChild !== node && last(lastChild.leadingComments).end <= node.start) {
          node.leadingComments = lastChild.leadingComments;
          lastChild.leadingComments = null;
        } else {
          for (i = lastChild.leadingComments.length - 2;i >= 0; --i) {
            if (lastChild.leadingComments[i].end <= node.start) {
              node.leadingComments = lastChild.leadingComments.splice(0, i + 1);
              break;
            }
          }
        }
      }
    } else if (this.state.leadingComments.length > 0) {
      if (last(this.state.leadingComments).end <= node.start) {
        if (this.state.commentPreviousNode) {
          for (j = 0;j < this.state.leadingComments.length; j++) {
            if (this.state.leadingComments[j].end < this.state.commentPreviousNode.end) {
              this.state.leadingComments.splice(j, 1);
              j--;
            }
          }
        }
        if (this.state.leadingComments.length > 0) {
          node.leadingComments = this.state.leadingComments;
          this.state.leadingComments = [];
        }
      } else {
        for (i = 0;i < this.state.leadingComments.length; i++) {
          if (this.state.leadingComments[i].end > node.start) {
            break;
          }
        }
        node.leadingComments = this.state.leadingComments.slice(0, i);
        if (node.leadingComments.length === 0) {
          node.leadingComments = null;
        }
        trailingComments = this.state.leadingComments.slice(i);
        if (trailingComments.length === 0) {
          trailingComments = null;
        }
      }
    }
    this.state.commentPreviousNode = node;
    if (trailingComments) {
      if (trailingComments.length && trailingComments[0].start >= node.start && last(trailingComments).end <= node.end) {
        node.innerComments = trailingComments;
      } else {
        node.trailingComments = trailingComments;
      }
    }
    stack.push(node);
  };
  var pp$7 = Parser.prototype;
  pp$7.estreeParseRegExpLiteral = function(_ref) {
    var { pattern, flags } = _ref;
    var regex = null;
    try {
      regex = new RegExp(pattern, flags);
    } catch (e) {}
    var node = this.estreeParseLiteral(regex);
    node.regex = { pattern, flags };
    return node;
  };
  pp$7.estreeParseLiteral = function(value) {
    return this.parseLiteral(value, "Literal");
  };
  pp$7.directiveToStmt = function(directive) {
    var directiveLiteral = directive.value;
    var stmt = this.startNodeAt(directive.start, directive.loc.start);
    var expression = this.startNodeAt(directiveLiteral.start, directiveLiteral.loc.start);
    expression.value = directiveLiteral.value;
    expression.raw = directiveLiteral.extra.raw;
    stmt.expression = this.finishNodeAt(expression, "Literal", directiveLiteral.end, directiveLiteral.loc.end);
    stmt.directive = directiveLiteral.extra.raw.slice(1, -1);
    return this.finishNodeAt(stmt, "ExpressionStatement", directive.end, directive.loc.end);
  };
  function isSimpleProperty(node) {
    return node && node.type === "Property" && node.kind === "init" && node.method === false;
  }
  var estreePlugin = function(instance) {
    instance.extend("checkDeclaration", function(inner) {
      return function(node) {
        if (isSimpleProperty(node)) {
          this.checkDeclaration(node.value);
        } else {
          inner.call(this, node);
        }
      };
    });
    instance.extend("checkGetterSetterParamCount", function() {
      return function(prop) {
        var paramCount = prop.kind === "get" ? 0 : 1;
        if (prop.value.params.length !== paramCount) {
          var start = prop.start;
          if (prop.kind === "get") {
            this.raise(start, "getter should have no params");
          } else {
            this.raise(start, "setter should have exactly one param");
          }
        }
      };
    });
    instance.extend("checkLVal", function(inner) {
      return function(expr, isBinding, checkClashes) {
        var _this = this;
        switch (expr.type) {
          case "ObjectPattern":
            expr.properties.forEach(function(prop) {
              _this.checkLVal(prop.type === "Property" ? prop.value : prop, isBinding, checkClashes, "object destructuring pattern");
            });
            break;
          default:
            for (var _len = arguments.length, args2 = Array(_len > 3 ? _len - 3 : 0), _key = 3;_key < _len; _key++) {
              args2[_key - 3] = arguments[_key];
            }
            inner.call.apply(inner, [this, expr, isBinding, checkClashes].concat(args2));
        }
      };
    });
    instance.extend("checkPropClash", function() {
      return function(prop, propHash) {
        if (prop.computed || !isSimpleProperty(prop))
          return;
        var key = prop.key;
        var name = key.type === "Identifier" ? key.name : String(key.value);
        if (name === "__proto__") {
          if (propHash.proto)
            this.raise(key.start, "Redefinition of __proto__ property");
          propHash.proto = true;
        }
      };
    });
    instance.extend("isStrictBody", function() {
      return function(node, isExpression) {
        if (!isExpression && node.body.body.length > 0) {
          for (var _iterator = node.body.body, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();; ) {
            var _ref2;
            if (_isArray) {
              if (_i >= _iterator.length)
                break;
              _ref2 = _iterator[_i++];
            } else {
              _i = _iterator.next();
              if (_i.done)
                break;
              _ref2 = _i.value;
            }
            var directive = _ref2;
            if (directive.type === "ExpressionStatement" && directive.expression.type === "Literal") {
              if (directive.expression.value === "use strict")
                return true;
            } else {
              break;
            }
          }
        }
        return false;
      };
    });
    instance.extend("isValidDirective", function() {
      return function(stmt) {
        return stmt.type === "ExpressionStatement" && stmt.expression.type === "Literal" && typeof stmt.expression.value === "string" && (!stmt.expression.extra || !stmt.expression.extra.parenthesized);
      };
    });
    instance.extend("stmtToDirective", function(inner) {
      return function(stmt) {
        var directive = inner.call(this, stmt);
        var value = stmt.expression.value;
        directive.value.value = value;
        return directive;
      };
    });
    instance.extend("parseBlockBody", function(inner) {
      return function(node) {
        var _this2 = this;
        for (var _len2 = arguments.length, args2 = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1;_key2 < _len2; _key2++) {
          args2[_key2 - 1] = arguments[_key2];
        }
        inner.call.apply(inner, [this, node].concat(args2));
        node.directives.reverse().forEach(function(directive) {
          node.body.unshift(_this2.directiveToStmt(directive));
        });
        delete node.directives;
      };
    });
    instance.extend("parseClassMethod", function() {
      return function(classBody, method, isGenerator, isAsync2) {
        this.parseMethod(method, isGenerator, isAsync2);
        if (method.typeParameters) {
          method.value.typeParameters = method.typeParameters;
          delete method.typeParameters;
        }
        classBody.body.push(this.finishNode(method, "MethodDefinition"));
      };
    });
    instance.extend("parseExprAtom", function(inner) {
      return function() {
        switch (this.state.type) {
          case types2.regexp:
            return this.estreeParseRegExpLiteral(this.state.value);
          case types2.num:
          case types2.string:
            return this.estreeParseLiteral(this.state.value);
          case types2._null:
            return this.estreeParseLiteral(null);
          case types2._true:
            return this.estreeParseLiteral(true);
          case types2._false:
            return this.estreeParseLiteral(false);
          default:
            for (var _len3 = arguments.length, args2 = Array(_len3), _key3 = 0;_key3 < _len3; _key3++) {
              args2[_key3] = arguments[_key3];
            }
            return inner.call.apply(inner, [this].concat(args2));
        }
      };
    });
    instance.extend("parseLiteral", function(inner) {
      return function() {
        for (var _len4 = arguments.length, args2 = Array(_len4), _key4 = 0;_key4 < _len4; _key4++) {
          args2[_key4] = arguments[_key4];
        }
        var node = inner.call.apply(inner, [this].concat(args2));
        node.raw = node.extra.raw;
        delete node.extra;
        return node;
      };
    });
    instance.extend("parseMethod", function(inner) {
      return function(node) {
        var funcNode = this.startNode();
        funcNode.kind = node.kind;
        for (var _len5 = arguments.length, args2 = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1;_key5 < _len5; _key5++) {
          args2[_key5 - 1] = arguments[_key5];
        }
        funcNode = inner.call.apply(inner, [this, funcNode].concat(args2));
        delete funcNode.kind;
        node.value = this.finishNode(funcNode, "FunctionExpression");
        return node;
      };
    });
    instance.extend("parseObjectMethod", function(inner) {
      return function() {
        for (var _len6 = arguments.length, args2 = Array(_len6), _key6 = 0;_key6 < _len6; _key6++) {
          args2[_key6] = arguments[_key6];
        }
        var node = inner.call.apply(inner, [this].concat(args2));
        if (node) {
          if (node.kind === "method")
            node.kind = "init";
          node.type = "Property";
        }
        return node;
      };
    });
    instance.extend("parseObjectProperty", function(inner) {
      return function() {
        for (var _len7 = arguments.length, args2 = Array(_len7), _key7 = 0;_key7 < _len7; _key7++) {
          args2[_key7] = arguments[_key7];
        }
        var node = inner.call.apply(inner, [this].concat(args2));
        if (node) {
          node.kind = "init";
          node.type = "Property";
        }
        return node;
      };
    });
    instance.extend("toAssignable", function(inner) {
      return function(node, isBinding) {
        for (var _len8 = arguments.length, args2 = Array(_len8 > 2 ? _len8 - 2 : 0), _key8 = 2;_key8 < _len8; _key8++) {
          args2[_key8 - 2] = arguments[_key8];
        }
        if (isSimpleProperty(node)) {
          this.toAssignable.apply(this, [node.value, isBinding].concat(args2));
          return node;
        } else if (node.type === "ObjectExpression") {
          node.type = "ObjectPattern";
          for (var _iterator2 = node.properties, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();; ) {
            var _ref3;
            if (_isArray2) {
              if (_i2 >= _iterator2.length)
                break;
              _ref3 = _iterator2[_i2++];
            } else {
              _i2 = _iterator2.next();
              if (_i2.done)
                break;
              _ref3 = _i2.value;
            }
            var prop = _ref3;
            if (prop.kind === "get" || prop.kind === "set") {
              this.raise(prop.key.start, "Object pattern can't contain getter or setter");
            } else if (prop.method) {
              this.raise(prop.key.start, "Object pattern can't contain methods");
            } else {
              this.toAssignable(prop, isBinding, "object destructuring pattern");
            }
          }
          return node;
        }
        return inner.call.apply(inner, [this, node, isBinding].concat(args2));
      };
    });
  };
  var primitiveTypes = ["any", "mixed", "empty", "bool", "boolean", "number", "string", "void", "null"];
  var pp$8 = Parser.prototype;
  pp$8.flowParseTypeInitialiser = function(tok) {
    var oldInType = this.state.inType;
    this.state.inType = true;
    this.expect(tok || types2.colon);
    var type = this.flowParseType();
    this.state.inType = oldInType;
    return type;
  };
  pp$8.flowParsePredicate = function() {
    var node = this.startNode();
    var moduloLoc = this.state.startLoc;
    var moduloPos = this.state.start;
    this.expect(types2.modulo);
    var checksLoc = this.state.startLoc;
    this.expectContextual("checks");
    if (moduloLoc.line !== checksLoc.line || moduloLoc.column !== checksLoc.column - 1) {
      this.raise(moduloPos, "Spaces between \xB4%\xB4 and \xB4checks\xB4 are not allowed here.");
    }
    if (this.eat(types2.parenL)) {
      node.expression = this.parseExpression();
      this.expect(types2.parenR);
      return this.finishNode(node, "DeclaredPredicate");
    } else {
      return this.finishNode(node, "InferredPredicate");
    }
  };
  pp$8.flowParseTypeAndPredicateInitialiser = function() {
    var oldInType = this.state.inType;
    this.state.inType = true;
    this.expect(types2.colon);
    var type = null;
    var predicate = null;
    if (this.match(types2.modulo)) {
      this.state.inType = oldInType;
      predicate = this.flowParsePredicate();
    } else {
      type = this.flowParseType();
      this.state.inType = oldInType;
      if (this.match(types2.modulo)) {
        predicate = this.flowParsePredicate();
      }
    }
    return [type, predicate];
  };
  pp$8.flowParseDeclareClass = function(node) {
    this.next();
    this.flowParseInterfaceish(node, true);
    return this.finishNode(node, "DeclareClass");
  };
  pp$8.flowParseDeclareFunction = function(node) {
    this.next();
    var id = node.id = this.parseIdentifier();
    var typeNode = this.startNode();
    var typeContainer = this.startNode();
    if (this.isRelational("<")) {
      typeNode.typeParameters = this.flowParseTypeParameterDeclaration();
    } else {
      typeNode.typeParameters = null;
    }
    this.expect(types2.parenL);
    var tmp = this.flowParseFunctionTypeParams();
    typeNode.params = tmp.params;
    typeNode.rest = tmp.rest;
    this.expect(types2.parenR);
    var predicate = null;
    var _flowParseTypeAndPred = this.flowParseTypeAndPredicateInitialiser();
    typeNode.returnType = _flowParseTypeAndPred[0];
    predicate = _flowParseTypeAndPred[1];
    typeContainer.typeAnnotation = this.finishNode(typeNode, "FunctionTypeAnnotation");
    typeContainer.predicate = predicate;
    id.typeAnnotation = this.finishNode(typeContainer, "TypeAnnotation");
    this.finishNode(id, id.type);
    this.semicolon();
    return this.finishNode(node, "DeclareFunction");
  };
  pp$8.flowParseDeclare = function(node) {
    if (this.match(types2._class)) {
      return this.flowParseDeclareClass(node);
    } else if (this.match(types2._function)) {
      return this.flowParseDeclareFunction(node);
    } else if (this.match(types2._var)) {
      return this.flowParseDeclareVariable(node);
    } else if (this.isContextual("module")) {
      if (this.lookahead().type === types2.dot) {
        return this.flowParseDeclareModuleExports(node);
      } else {
        return this.flowParseDeclareModule(node);
      }
    } else if (this.isContextual("type")) {
      return this.flowParseDeclareTypeAlias(node);
    } else if (this.isContextual("opaque")) {
      return this.flowParseDeclareOpaqueType(node);
    } else if (this.isContextual("interface")) {
      return this.flowParseDeclareInterface(node);
    } else if (this.match(types2._export)) {
      return this.flowParseDeclareExportDeclaration(node);
    } else {
      this.unexpected();
    }
  };
  pp$8.flowParseDeclareExportDeclaration = function(node) {
    this.expect(types2._export);
    if (this.isContextual("opaque")) {
      node.declaration = this.flowParseDeclare(this.startNode());
      node.default = false;
      return this.finishNode(node, "DeclareExportDeclaration");
    }
    throw this.unexpected();
  };
  pp$8.flowParseDeclareVariable = function(node) {
    this.next();
    node.id = this.flowParseTypeAnnotatableIdentifier();
    this.semicolon();
    return this.finishNode(node, "DeclareVariable");
  };
  pp$8.flowParseDeclareModule = function(node) {
    this.next();
    if (this.match(types2.string)) {
      node.id = this.parseExprAtom();
    } else {
      node.id = this.parseIdentifier();
    }
    var bodyNode = node.body = this.startNode();
    var body = bodyNode.body = [];
    this.expect(types2.braceL);
    while (!this.match(types2.braceR)) {
      var _bodyNode = this.startNode();
      if (this.match(types2._import)) {
        var lookahead = this.lookahead();
        if (lookahead.value !== "type" && lookahead.value !== "typeof") {
          this.unexpected(null, "Imports within a `declare module` body must always be `import type` or `import typeof`");
        }
        this.parseImport(_bodyNode);
      } else {
        this.expectContextual("declare", "Only declares and type imports are allowed inside declare module");
        _bodyNode = this.flowParseDeclare(_bodyNode, true);
      }
      body.push(_bodyNode);
    }
    this.expect(types2.braceR);
    this.finishNode(bodyNode, "BlockStatement");
    return this.finishNode(node, "DeclareModule");
  };
  pp$8.flowParseDeclareModuleExports = function(node) {
    this.expectContextual("module");
    this.expect(types2.dot);
    this.expectContextual("exports");
    node.typeAnnotation = this.flowParseTypeAnnotation();
    this.semicolon();
    return this.finishNode(node, "DeclareModuleExports");
  };
  pp$8.flowParseDeclareTypeAlias = function(node) {
    this.next();
    this.flowParseTypeAlias(node);
    return this.finishNode(node, "DeclareTypeAlias");
  };
  pp$8.flowParseDeclareOpaqueType = function(node) {
    this.next();
    this.flowParseOpaqueType(node, true);
    return this.finishNode(node, "DeclareOpaqueType");
  };
  pp$8.flowParseDeclareInterface = function(node) {
    this.next();
    this.flowParseInterfaceish(node);
    return this.finishNode(node, "DeclareInterface");
  };
  pp$8.flowParseInterfaceish = function(node) {
    node.id = this.parseIdentifier();
    if (this.isRelational("<")) {
      node.typeParameters = this.flowParseTypeParameterDeclaration();
    } else {
      node.typeParameters = null;
    }
    node.extends = [];
    node.mixins = [];
    if (this.eat(types2._extends)) {
      do {
        node.extends.push(this.flowParseInterfaceExtends());
      } while (this.eat(types2.comma));
    }
    if (this.isContextual("mixins")) {
      this.next();
      do {
        node.mixins.push(this.flowParseInterfaceExtends());
      } while (this.eat(types2.comma));
    }
    node.body = this.flowParseObjectType(true, false, false);
  };
  pp$8.flowParseInterfaceExtends = function() {
    var node = this.startNode();
    node.id = this.flowParseQualifiedTypeIdentifier();
    if (this.isRelational("<")) {
      node.typeParameters = this.flowParseTypeParameterInstantiation();
    } else {
      node.typeParameters = null;
    }
    return this.finishNode(node, "InterfaceExtends");
  };
  pp$8.flowParseInterface = function(node) {
    this.flowParseInterfaceish(node, false);
    return this.finishNode(node, "InterfaceDeclaration");
  };
  pp$8.flowParseRestrictedIdentifier = function(liberal) {
    if (primitiveTypes.indexOf(this.state.value) > -1) {
      this.raise(this.state.start, "Cannot overwrite primitive type " + this.state.value);
    }
    return this.parseIdentifier(liberal);
  };
  pp$8.flowParseTypeAlias = function(node) {
    node.id = this.flowParseRestrictedIdentifier();
    if (this.isRelational("<")) {
      node.typeParameters = this.flowParseTypeParameterDeclaration();
    } else {
      node.typeParameters = null;
    }
    node.right = this.flowParseTypeInitialiser(types2.eq);
    this.semicolon();
    return this.finishNode(node, "TypeAlias");
  };
  pp$8.flowParseOpaqueType = function(node, declare) {
    this.expectContextual("type");
    node.id = this.flowParseRestrictedIdentifier();
    if (this.isRelational("<")) {
      node.typeParameters = this.flowParseTypeParameterDeclaration();
    } else {
      node.typeParameters = null;
    }
    node.supertype = null;
    if (this.match(types2.colon)) {
      node.supertype = this.flowParseTypeInitialiser(types2.colon);
    }
    node.impltype = null;
    if (!declare) {
      node.impltype = this.flowParseTypeInitialiser(types2.eq);
    }
    this.semicolon();
    return this.finishNode(node, "OpaqueType");
  };
  pp$8.flowParseTypeParameter = function() {
    var node = this.startNode();
    var variance = this.flowParseVariance();
    var ident = this.flowParseTypeAnnotatableIdentifier();
    node.name = ident.name;
    node.variance = variance;
    node.bound = ident.typeAnnotation;
    if (this.match(types2.eq)) {
      this.eat(types2.eq);
      node.default = this.flowParseType();
    }
    return this.finishNode(node, "TypeParameter");
  };
  pp$8.flowParseTypeParameterDeclaration = function() {
    var oldInType = this.state.inType;
    var node = this.startNode();
    node.params = [];
    this.state.inType = true;
    if (this.isRelational("<") || this.match(types2.jsxTagStart)) {
      this.next();
    } else {
      this.unexpected();
    }
    do {
      node.params.push(this.flowParseTypeParameter());
      if (!this.isRelational(">")) {
        this.expect(types2.comma);
      }
    } while (!this.isRelational(">"));
    this.expectRelational(">");
    this.state.inType = oldInType;
    return this.finishNode(node, "TypeParameterDeclaration");
  };
  pp$8.flowParseTypeParameterInstantiation = function() {
    var node = this.startNode();
    var oldInType = this.state.inType;
    node.params = [];
    this.state.inType = true;
    this.expectRelational("<");
    while (!this.isRelational(">")) {
      node.params.push(this.flowParseType());
      if (!this.isRelational(">")) {
        this.expect(types2.comma);
      }
    }
    this.expectRelational(">");
    this.state.inType = oldInType;
    return this.finishNode(node, "TypeParameterInstantiation");
  };
  pp$8.flowParseObjectPropertyKey = function() {
    return this.match(types2.num) || this.match(types2.string) ? this.parseExprAtom() : this.parseIdentifier(true);
  };
  pp$8.flowParseObjectTypeIndexer = function(node, isStatic, variance) {
    node.static = isStatic;
    this.expect(types2.bracketL);
    if (this.lookahead().type === types2.colon) {
      node.id = this.flowParseObjectPropertyKey();
      node.key = this.flowParseTypeInitialiser();
    } else {
      node.id = null;
      node.key = this.flowParseType();
    }
    this.expect(types2.bracketR);
    node.value = this.flowParseTypeInitialiser();
    node.variance = variance;
    this.flowObjectTypeSemicolon();
    return this.finishNode(node, "ObjectTypeIndexer");
  };
  pp$8.flowParseObjectTypeMethodish = function(node) {
    node.params = [];
    node.rest = null;
    node.typeParameters = null;
    if (this.isRelational("<")) {
      node.typeParameters = this.flowParseTypeParameterDeclaration();
    }
    this.expect(types2.parenL);
    while (!this.match(types2.parenR) && !this.match(types2.ellipsis)) {
      node.params.push(this.flowParseFunctionTypeParam());
      if (!this.match(types2.parenR)) {
        this.expect(types2.comma);
      }
    }
    if (this.eat(types2.ellipsis)) {
      node.rest = this.flowParseFunctionTypeParam();
    }
    this.expect(types2.parenR);
    node.returnType = this.flowParseTypeInitialiser();
    return this.finishNode(node, "FunctionTypeAnnotation");
  };
  pp$8.flowParseObjectTypeMethod = function(startPos, startLoc, isStatic, key) {
    var node = this.startNodeAt(startPos, startLoc);
    node.value = this.flowParseObjectTypeMethodish(this.startNodeAt(startPos, startLoc));
    node.static = isStatic;
    node.key = key;
    node.optional = false;
    this.flowObjectTypeSemicolon();
    return this.finishNode(node, "ObjectTypeProperty");
  };
  pp$8.flowParseObjectTypeCallProperty = function(node, isStatic) {
    var valueNode = this.startNode();
    node.static = isStatic;
    node.value = this.flowParseObjectTypeMethodish(valueNode);
    this.flowObjectTypeSemicolon();
    return this.finishNode(node, "ObjectTypeCallProperty");
  };
  pp$8.flowParseObjectType = function(allowStatic, allowExact, allowSpread) {
    var oldInType = this.state.inType;
    this.state.inType = true;
    var nodeStart = this.startNode();
    var node = undefined;
    var propertyKey = undefined;
    var isStatic = false;
    nodeStart.callProperties = [];
    nodeStart.properties = [];
    nodeStart.indexers = [];
    var endDelim = undefined;
    var exact = undefined;
    if (allowExact && this.match(types2.braceBarL)) {
      this.expect(types2.braceBarL);
      endDelim = types2.braceBarR;
      exact = true;
    } else {
      this.expect(types2.braceL);
      endDelim = types2.braceR;
      exact = false;
    }
    nodeStart.exact = exact;
    while (!this.match(endDelim)) {
      var optional = false;
      var startPos = this.state.start;
      var startLoc = this.state.startLoc;
      node = this.startNode();
      if (allowStatic && this.isContextual("static") && this.lookahead().type !== types2.colon) {
        this.next();
        isStatic = true;
      }
      var variancePos = this.state.start;
      var variance = this.flowParseVariance();
      if (this.match(types2.bracketL)) {
        nodeStart.indexers.push(this.flowParseObjectTypeIndexer(node, isStatic, variance));
      } else if (this.match(types2.parenL) || this.isRelational("<")) {
        if (variance) {
          this.unexpected(variancePos);
        }
        nodeStart.callProperties.push(this.flowParseObjectTypeCallProperty(node, isStatic));
      } else {
        if (this.match(types2.ellipsis)) {
          if (!allowSpread) {
            this.unexpected(null, "Spread operator cannot appear in class or interface definitions");
          }
          if (variance) {
            this.unexpected(variance.start, "Spread properties cannot have variance");
          }
          this.expect(types2.ellipsis);
          node.argument = this.flowParseType();
          this.flowObjectTypeSemicolon();
          nodeStart.properties.push(this.finishNode(node, "ObjectTypeSpreadProperty"));
        } else {
          propertyKey = this.flowParseObjectPropertyKey();
          if (this.isRelational("<") || this.match(types2.parenL)) {
            if (variance) {
              this.unexpected(variance.start);
            }
            nodeStart.properties.push(this.flowParseObjectTypeMethod(startPos, startLoc, isStatic, propertyKey));
          } else {
            if (this.eat(types2.question)) {
              optional = true;
            }
            node.key = propertyKey;
            node.value = this.flowParseTypeInitialiser();
            node.optional = optional;
            node.static = isStatic;
            node.variance = variance;
            this.flowObjectTypeSemicolon();
            nodeStart.properties.push(this.finishNode(node, "ObjectTypeProperty"));
          }
        }
      }
      isStatic = false;
    }
    this.expect(endDelim);
    var out = this.finishNode(nodeStart, "ObjectTypeAnnotation");
    this.state.inType = oldInType;
    return out;
  };
  pp$8.flowObjectTypeSemicolon = function() {
    if (!this.eat(types2.semi) && !this.eat(types2.comma) && !this.match(types2.braceR) && !this.match(types2.braceBarR)) {
      this.unexpected();
    }
  };
  pp$8.flowParseQualifiedTypeIdentifier = function(startPos, startLoc, id) {
    startPos = startPos || this.state.start;
    startLoc = startLoc || this.state.startLoc;
    var node = id || this.parseIdentifier();
    while (this.eat(types2.dot)) {
      var node2 = this.startNodeAt(startPos, startLoc);
      node2.qualification = node;
      node2.id = this.parseIdentifier();
      node = this.finishNode(node2, "QualifiedTypeIdentifier");
    }
    return node;
  };
  pp$8.flowParseGenericType = function(startPos, startLoc, id) {
    var node = this.startNodeAt(startPos, startLoc);
    node.typeParameters = null;
    node.id = this.flowParseQualifiedTypeIdentifier(startPos, startLoc, id);
    if (this.isRelational("<")) {
      node.typeParameters = this.flowParseTypeParameterInstantiation();
    }
    return this.finishNode(node, "GenericTypeAnnotation");
  };
  pp$8.flowParseTypeofType = function() {
    var node = this.startNode();
    this.expect(types2._typeof);
    node.argument = this.flowParsePrimaryType();
    return this.finishNode(node, "TypeofTypeAnnotation");
  };
  pp$8.flowParseTupleType = function() {
    var node = this.startNode();
    node.types = [];
    this.expect(types2.bracketL);
    while (this.state.pos < this.input.length && !this.match(types2.bracketR)) {
      node.types.push(this.flowParseType());
      if (this.match(types2.bracketR))
        break;
      this.expect(types2.comma);
    }
    this.expect(types2.bracketR);
    return this.finishNode(node, "TupleTypeAnnotation");
  };
  pp$8.flowParseFunctionTypeParam = function() {
    var name = null;
    var optional = false;
    var typeAnnotation = null;
    var node = this.startNode();
    var lh = this.lookahead();
    if (lh.type === types2.colon || lh.type === types2.question) {
      name = this.parseIdentifier();
      if (this.eat(types2.question)) {
        optional = true;
      }
      typeAnnotation = this.flowParseTypeInitialiser();
    } else {
      typeAnnotation = this.flowParseType();
    }
    node.name = name;
    node.optional = optional;
    node.typeAnnotation = typeAnnotation;
    return this.finishNode(node, "FunctionTypeParam");
  };
  pp$8.reinterpretTypeAsFunctionTypeParam = function(type) {
    var node = this.startNodeAt(type.start, type.loc.start);
    node.name = null;
    node.optional = false;
    node.typeAnnotation = type;
    return this.finishNode(node, "FunctionTypeParam");
  };
  pp$8.flowParseFunctionTypeParams = function() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var ret = { params, rest: null };
    while (!this.match(types2.parenR) && !this.match(types2.ellipsis)) {
      ret.params.push(this.flowParseFunctionTypeParam());
      if (!this.match(types2.parenR)) {
        this.expect(types2.comma);
      }
    }
    if (this.eat(types2.ellipsis)) {
      ret.rest = this.flowParseFunctionTypeParam();
    }
    return ret;
  };
  pp$8.flowIdentToTypeAnnotation = function(startPos, startLoc, node, id) {
    switch (id.name) {
      case "any":
        return this.finishNode(node, "AnyTypeAnnotation");
      case "void":
        return this.finishNode(node, "VoidTypeAnnotation");
      case "bool":
      case "boolean":
        return this.finishNode(node, "BooleanTypeAnnotation");
      case "mixed":
        return this.finishNode(node, "MixedTypeAnnotation");
      case "empty":
        return this.finishNode(node, "EmptyTypeAnnotation");
      case "number":
        return this.finishNode(node, "NumberTypeAnnotation");
      case "string":
        return this.finishNode(node, "StringTypeAnnotation");
      default:
        return this.flowParseGenericType(startPos, startLoc, id);
    }
  };
  pp$8.flowParsePrimaryType = function() {
    var startPos = this.state.start;
    var startLoc = this.state.startLoc;
    var node = this.startNode();
    var tmp = undefined;
    var type = undefined;
    var isGroupedType = false;
    var oldNoAnonFunctionType = this.state.noAnonFunctionType;
    switch (this.state.type) {
      case types2.name:
        return this.flowIdentToTypeAnnotation(startPos, startLoc, node, this.parseIdentifier());
      case types2.braceL:
        return this.flowParseObjectType(false, false, true);
      case types2.braceBarL:
        return this.flowParseObjectType(false, true, true);
      case types2.bracketL:
        return this.flowParseTupleType();
      case types2.relational:
        if (this.state.value === "<") {
          node.typeParameters = this.flowParseTypeParameterDeclaration();
          this.expect(types2.parenL);
          tmp = this.flowParseFunctionTypeParams();
          node.params = tmp.params;
          node.rest = tmp.rest;
          this.expect(types2.parenR);
          this.expect(types2.arrow);
          node.returnType = this.flowParseType();
          return this.finishNode(node, "FunctionTypeAnnotation");
        }
        break;
      case types2.parenL:
        this.next();
        if (!this.match(types2.parenR) && !this.match(types2.ellipsis)) {
          if (this.match(types2.name)) {
            var token = this.lookahead().type;
            isGroupedType = token !== types2.question && token !== types2.colon;
          } else {
            isGroupedType = true;
          }
        }
        if (isGroupedType) {
          this.state.noAnonFunctionType = false;
          type = this.flowParseType();
          this.state.noAnonFunctionType = oldNoAnonFunctionType;
          if (this.state.noAnonFunctionType || !(this.match(types2.comma) || this.match(types2.parenR) && this.lookahead().type === types2.arrow)) {
            this.expect(types2.parenR);
            return type;
          } else {
            this.eat(types2.comma);
          }
        }
        if (type) {
          tmp = this.flowParseFunctionTypeParams([this.reinterpretTypeAsFunctionTypeParam(type)]);
        } else {
          tmp = this.flowParseFunctionTypeParams();
        }
        node.params = tmp.params;
        node.rest = tmp.rest;
        this.expect(types2.parenR);
        this.expect(types2.arrow);
        node.returnType = this.flowParseType();
        node.typeParameters = null;
        return this.finishNode(node, "FunctionTypeAnnotation");
      case types2.string:
        return this.parseLiteral(this.state.value, "StringLiteralTypeAnnotation");
      case types2._true:
      case types2._false:
        node.value = this.match(types2._true);
        this.next();
        return this.finishNode(node, "BooleanLiteralTypeAnnotation");
      case types2.plusMin:
        if (this.state.value === "-") {
          this.next();
          if (!this.match(types2.num))
            this.unexpected(null, "Unexpected token, expected number");
          return this.parseLiteral(-this.state.value, "NumericLiteralTypeAnnotation", node.start, node.loc.start);
        }
        this.unexpected();
      case types2.num:
        return this.parseLiteral(this.state.value, "NumericLiteralTypeAnnotation");
      case types2._null:
        node.value = this.match(types2._null);
        this.next();
        return this.finishNode(node, "NullLiteralTypeAnnotation");
      case types2._this:
        node.value = this.match(types2._this);
        this.next();
        return this.finishNode(node, "ThisTypeAnnotation");
      case types2.star:
        this.next();
        return this.finishNode(node, "ExistentialTypeParam");
      default:
        if (this.state.type.keyword === "typeof") {
          return this.flowParseTypeofType();
        }
    }
    this.unexpected();
  };
  pp$8.flowParsePostfixType = function() {
    var startPos = this.state.start, startLoc = this.state.startLoc;
    var type = this.flowParsePrimaryType();
    while (!this.canInsertSemicolon() && this.match(types2.bracketL)) {
      var node = this.startNodeAt(startPos, startLoc);
      node.elementType = type;
      this.expect(types2.bracketL);
      this.expect(types2.bracketR);
      type = this.finishNode(node, "ArrayTypeAnnotation");
    }
    return type;
  };
  pp$8.flowParsePrefixType = function() {
    var node = this.startNode();
    if (this.eat(types2.question)) {
      node.typeAnnotation = this.flowParsePrefixType();
      return this.finishNode(node, "NullableTypeAnnotation");
    } else {
      return this.flowParsePostfixType();
    }
  };
  pp$8.flowParseAnonFunctionWithoutParens = function() {
    var param = this.flowParsePrefixType();
    if (!this.state.noAnonFunctionType && this.eat(types2.arrow)) {
      var node = this.startNodeAt(param.start, param.loc.start);
      node.params = [this.reinterpretTypeAsFunctionTypeParam(param)];
      node.rest = null;
      node.returnType = this.flowParseType();
      node.typeParameters = null;
      return this.finishNode(node, "FunctionTypeAnnotation");
    }
    return param;
  };
  pp$8.flowParseIntersectionType = function() {
    var node = this.startNode();
    this.eat(types2.bitwiseAND);
    var type = this.flowParseAnonFunctionWithoutParens();
    node.types = [type];
    while (this.eat(types2.bitwiseAND)) {
      node.types.push(this.flowParseAnonFunctionWithoutParens());
    }
    return node.types.length === 1 ? type : this.finishNode(node, "IntersectionTypeAnnotation");
  };
  pp$8.flowParseUnionType = function() {
    var node = this.startNode();
    this.eat(types2.bitwiseOR);
    var type = this.flowParseIntersectionType();
    node.types = [type];
    while (this.eat(types2.bitwiseOR)) {
      node.types.push(this.flowParseIntersectionType());
    }
    return node.types.length === 1 ? type : this.finishNode(node, "UnionTypeAnnotation");
  };
  pp$8.flowParseType = function() {
    var oldInType = this.state.inType;
    this.state.inType = true;
    var type = this.flowParseUnionType();
    this.state.inType = oldInType;
    return type;
  };
  pp$8.flowParseTypeAnnotation = function() {
    var node = this.startNode();
    node.typeAnnotation = this.flowParseTypeInitialiser();
    return this.finishNode(node, "TypeAnnotation");
  };
  pp$8.flowParseTypeAndPredicateAnnotation = function() {
    var node = this.startNode();
    var _flowParseTypeAndPred2 = this.flowParseTypeAndPredicateInitialiser();
    node.typeAnnotation = _flowParseTypeAndPred2[0];
    node.predicate = _flowParseTypeAndPred2[1];
    return this.finishNode(node, "TypeAnnotation");
  };
  pp$8.flowParseTypeAnnotatableIdentifier = function() {
    var ident = this.flowParseRestrictedIdentifier();
    if (this.match(types2.colon)) {
      ident.typeAnnotation = this.flowParseTypeAnnotation();
      this.finishNode(ident, ident.type);
    }
    return ident;
  };
  pp$8.typeCastToParameter = function(node) {
    node.expression.typeAnnotation = node.typeAnnotation;
    return this.finishNodeAt(node.expression, node.expression.type, node.typeAnnotation.end, node.typeAnnotation.loc.end);
  };
  pp$8.flowParseVariance = function() {
    var variance = null;
    if (this.match(types2.plusMin)) {
      if (this.state.value === "+") {
        variance = "plus";
      } else if (this.state.value === "-") {
        variance = "minus";
      }
      this.next();
    }
    return variance;
  };
  var flowPlugin = function(instance) {
    instance.extend("parseFunctionBody", function(inner) {
      return function(node, allowExpression) {
        if (this.match(types2.colon) && !allowExpression) {
          node.returnType = this.flowParseTypeAndPredicateAnnotation();
        }
        return inner.call(this, node, allowExpression);
      };
    });
    instance.extend("parseStatement", function(inner) {
      return function(declaration, topLevel) {
        if (this.state.strict && this.match(types2.name) && this.state.value === "interface") {
          var node = this.startNode();
          this.next();
          return this.flowParseInterface(node);
        } else {
          return inner.call(this, declaration, topLevel);
        }
      };
    });
    instance.extend("parseExpressionStatement", function(inner) {
      return function(node, expr) {
        if (expr.type === "Identifier") {
          if (expr.name === "declare") {
            if (this.match(types2._class) || this.match(types2.name) || this.match(types2._function) || this.match(types2._var) || this.match(types2._export)) {
              return this.flowParseDeclare(node);
            }
          } else if (this.match(types2.name)) {
            if (expr.name === "interface") {
              return this.flowParseInterface(node);
            } else if (expr.name === "type") {
              return this.flowParseTypeAlias(node);
            } else if (expr.name === "opaque") {
              return this.flowParseOpaqueType(node, false);
            }
          }
        }
        return inner.call(this, node, expr);
      };
    });
    instance.extend("shouldParseExportDeclaration", function(inner) {
      return function() {
        return this.isContextual("type") || this.isContextual("interface") || this.isContextual("opaque") || inner.call(this);
      };
    });
    instance.extend("isExportDefaultSpecifier", function(inner) {
      return function() {
        if (this.match(types2.name) && (this.state.value === "type" || this.state.value === "interface" || this.state.value === "opaque")) {
          return false;
        }
        return inner.call(this);
      };
    });
    instance.extend("parseConditional", function(inner) {
      return function(expr, noIn, startPos, startLoc, refNeedsArrowPos) {
        if (refNeedsArrowPos && this.match(types2.question)) {
          var state = this.state.clone();
          try {
            return inner.call(this, expr, noIn, startPos, startLoc);
          } catch (err) {
            if (err instanceof SyntaxError) {
              this.state = state;
              refNeedsArrowPos.start = err.pos || this.state.start;
              return expr;
            } else {
              throw err;
            }
          }
        }
        return inner.call(this, expr, noIn, startPos, startLoc);
      };
    });
    instance.extend("parseParenItem", function(inner) {
      return function(node, startPos, startLoc) {
        node = inner.call(this, node, startPos, startLoc);
        if (this.eat(types2.question)) {
          node.optional = true;
        }
        if (this.match(types2.colon)) {
          var typeCastNode = this.startNodeAt(startPos, startLoc);
          typeCastNode.expression = node;
          typeCastNode.typeAnnotation = this.flowParseTypeAnnotation();
          return this.finishNode(typeCastNode, "TypeCastExpression");
        }
        return node;
      };
    });
    instance.extend("parseExport", function(inner) {
      return function(node) {
        node = inner.call(this, node);
        if (node.type === "ExportNamedDeclaration") {
          node.exportKind = node.exportKind || "value";
        }
        return node;
      };
    });
    instance.extend("parseExportDeclaration", function(inner) {
      return function(node) {
        if (this.isContextual("type")) {
          node.exportKind = "type";
          var declarationNode = this.startNode();
          this.next();
          if (this.match(types2.braceL)) {
            node.specifiers = this.parseExportSpecifiers();
            this.parseExportFrom(node);
            return null;
          } else {
            return this.flowParseTypeAlias(declarationNode);
          }
        } else if (this.isContextual("opaque")) {
          node.exportKind = "type";
          var _declarationNode = this.startNode();
          this.next();
          return this.flowParseOpaqueType(_declarationNode, false);
        } else if (this.isContextual("interface")) {
          node.exportKind = "type";
          var _declarationNode2 = this.startNode();
          this.next();
          return this.flowParseInterface(_declarationNode2);
        } else {
          return inner.call(this, node);
        }
      };
    });
    instance.extend("parseClassId", function(inner) {
      return function(node) {
        inner.apply(this, arguments);
        if (this.isRelational("<")) {
          node.typeParameters = this.flowParseTypeParameterDeclaration();
        }
      };
    });
    instance.extend("isKeyword", function(inner) {
      return function(name) {
        if (this.state.inType && name === "void") {
          return false;
        } else {
          return inner.call(this, name);
        }
      };
    });
    instance.extend("readToken", function(inner) {
      return function(code) {
        if (this.state.inType && (code === 62 || code === 60)) {
          return this.finishOp(types2.relational, 1);
        } else {
          return inner.call(this, code);
        }
      };
    });
    instance.extend("jsx_readToken", function(inner) {
      return function() {
        if (!this.state.inType)
          return inner.call(this);
      };
    });
    instance.extend("toAssignable", function(inner) {
      return function(node, isBinding, contextDescription) {
        if (node.type === "TypeCastExpression") {
          return inner.call(this, this.typeCastToParameter(node), isBinding, contextDescription);
        } else {
          return inner.call(this, node, isBinding, contextDescription);
        }
      };
    });
    instance.extend("toAssignableList", function(inner) {
      return function(exprList, isBinding, contextDescription) {
        for (var i = 0;i < exprList.length; i++) {
          var expr = exprList[i];
          if (expr && expr.type === "TypeCastExpression") {
            exprList[i] = this.typeCastToParameter(expr);
          }
        }
        return inner.call(this, exprList, isBinding, contextDescription);
      };
    });
    instance.extend("toReferencedList", function() {
      return function(exprList) {
        for (var i = 0;i < exprList.length; i++) {
          var expr = exprList[i];
          if (expr && expr._exprListItem && expr.type === "TypeCastExpression") {
            this.raise(expr.start, "Unexpected type cast");
          }
        }
        return exprList;
      };
    });
    instance.extend("parseExprListItem", function(inner) {
      return function() {
        var container = this.startNode();
        for (var _len = arguments.length, args2 = Array(_len), _key = 0;_key < _len; _key++) {
          args2[_key] = arguments[_key];
        }
        var node = inner.call.apply(inner, [this].concat(args2));
        if (this.match(types2.colon)) {
          container._exprListItem = true;
          container.expression = node;
          container.typeAnnotation = this.flowParseTypeAnnotation();
          return this.finishNode(container, "TypeCastExpression");
        } else {
          return node;
        }
      };
    });
    instance.extend("checkLVal", function(inner) {
      return function(node) {
        if (node.type !== "TypeCastExpression") {
          return inner.apply(this, arguments);
        }
      };
    });
    instance.extend("parseClassProperty", function(inner) {
      return function(node) {
        delete node.variancePos;
        if (this.match(types2.colon)) {
          node.typeAnnotation = this.flowParseTypeAnnotation();
        }
        return inner.call(this, node);
      };
    });
    instance.extend("isClassMethod", function(inner) {
      return function() {
        return this.isRelational("<") || inner.call(this);
      };
    });
    instance.extend("isClassProperty", function(inner) {
      return function() {
        return this.match(types2.colon) || inner.call(this);
      };
    });
    instance.extend("isNonstaticConstructor", function(inner) {
      return function(method) {
        return !this.match(types2.colon) && inner.call(this, method);
      };
    });
    instance.extend("parseClassMethod", function(inner) {
      return function(classBody, method) {
        if (method.variance) {
          this.unexpected(method.variancePos);
        }
        delete method.variance;
        delete method.variancePos;
        if (this.isRelational("<")) {
          method.typeParameters = this.flowParseTypeParameterDeclaration();
        }
        for (var _len2 = arguments.length, args2 = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2;_key2 < _len2; _key2++) {
          args2[_key2 - 2] = arguments[_key2];
        }
        inner.call.apply(inner, [this, classBody, method].concat(args2));
      };
    });
    instance.extend("parseClassSuper", function(inner) {
      return function(node, isStatement) {
        inner.call(this, node, isStatement);
        if (node.superClass && this.isRelational("<")) {
          node.superTypeParameters = this.flowParseTypeParameterInstantiation();
        }
        if (this.isContextual("implements")) {
          this.next();
          var implemented = node.implements = [];
          do {
            var _node = this.startNode();
            _node.id = this.parseIdentifier();
            if (this.isRelational("<")) {
              _node.typeParameters = this.flowParseTypeParameterInstantiation();
            } else {
              _node.typeParameters = null;
            }
            implemented.push(this.finishNode(_node, "ClassImplements"));
          } while (this.eat(types2.comma));
        }
      };
    });
    instance.extend("parsePropertyName", function(inner) {
      return function(node) {
        var variancePos = this.state.start;
        var variance = this.flowParseVariance();
        var key = inner.call(this, node);
        node.variance = variance;
        node.variancePos = variancePos;
        return key;
      };
    });
    instance.extend("parseObjPropValue", function(inner) {
      return function(prop) {
        if (prop.variance) {
          this.unexpected(prop.variancePos);
        }
        delete prop.variance;
        delete prop.variancePos;
        var typeParameters = undefined;
        if (this.isRelational("<")) {
          typeParameters = this.flowParseTypeParameterDeclaration();
          if (!this.match(types2.parenL))
            this.unexpected();
        }
        inner.apply(this, arguments);
        if (typeParameters) {
          (prop.value || prop).typeParameters = typeParameters;
        }
      };
    });
    instance.extend("parseAssignableListItemTypes", function() {
      return function(param) {
        if (this.eat(types2.question)) {
          param.optional = true;
        }
        if (this.match(types2.colon)) {
          param.typeAnnotation = this.flowParseTypeAnnotation();
        }
        this.finishNode(param, param.type);
        return param;
      };
    });
    instance.extend("parseMaybeDefault", function(inner) {
      return function() {
        for (var _len3 = arguments.length, args2 = Array(_len3), _key3 = 0;_key3 < _len3; _key3++) {
          args2[_key3] = arguments[_key3];
        }
        var node = inner.apply(this, args2);
        if (node.type === "AssignmentPattern" && node.typeAnnotation && node.right.start < node.typeAnnotation.start) {
          this.raise(node.typeAnnotation.start, "Type annotations must come before default assignments, e.g. instead of `age = 25: number` use `age: number = 25`");
        }
        return node;
      };
    });
    instance.extend("parseImportSpecifiers", function(inner) {
      return function(node) {
        node.importKind = "value";
        var kind = null;
        if (this.match(types2._typeof)) {
          kind = "typeof";
        } else if (this.isContextual("type")) {
          kind = "type";
        }
        if (kind) {
          var lh = this.lookahead();
          if (lh.type === types2.name && lh.value !== "from" || lh.type === types2.braceL || lh.type === types2.star) {
            this.next();
            node.importKind = kind;
          }
        }
        inner.call(this, node);
      };
    });
    instance.extend("parseImportSpecifier", function() {
      return function(node) {
        var specifier = this.startNode();
        var firstIdentLoc = this.state.start;
        var firstIdent = this.parseIdentifier(true);
        var specifierTypeKind = null;
        if (firstIdent.name === "type") {
          specifierTypeKind = "type";
        } else if (firstIdent.name === "typeof") {
          specifierTypeKind = "typeof";
        }
        var isBinding = false;
        if (this.isContextual("as")) {
          var as_ident = this.parseIdentifier(true);
          if (specifierTypeKind !== null && !this.match(types2.name) && !this.state.type.keyword) {
            specifier.imported = as_ident;
            specifier.importKind = specifierTypeKind;
            specifier.local = as_ident.__clone();
          } else {
            specifier.imported = firstIdent;
            specifier.importKind = null;
            specifier.local = this.parseIdentifier();
          }
        } else if (specifierTypeKind !== null && (this.match(types2.name) || this.state.type.keyword)) {
          specifier.imported = this.parseIdentifier(true);
          specifier.importKind = specifierTypeKind;
          if (this.eatContextual("as")) {
            specifier.local = this.parseIdentifier();
          } else {
            isBinding = true;
            specifier.local = specifier.imported.__clone();
          }
        } else {
          isBinding = true;
          specifier.imported = firstIdent;
          specifier.importKind = null;
          specifier.local = specifier.imported.__clone();
        }
        if ((node.importKind === "type" || node.importKind === "typeof") && (specifier.importKind === "type" || specifier.importKind === "typeof")) {
          this.raise(firstIdentLoc, "`The `type` and `typeof` keywords on named imports can only be used on regular `import` statements. It cannot be used with `import type` or `import typeof` statements`");
        }
        if (isBinding)
          this.checkReservedWord(specifier.local.name, specifier.start, true, true);
        this.checkLVal(specifier.local, true, undefined, "import specifier");
        node.specifiers.push(this.finishNode(specifier, "ImportSpecifier"));
      };
    });
    instance.extend("parseFunctionParams", function(inner) {
      return function(node) {
        if (this.isRelational("<")) {
          node.typeParameters = this.flowParseTypeParameterDeclaration();
        }
        inner.call(this, node);
      };
    });
    instance.extend("parseVarHead", function(inner) {
      return function(decl) {
        inner.call(this, decl);
        if (this.match(types2.colon)) {
          decl.id.typeAnnotation = this.flowParseTypeAnnotation();
          this.finishNode(decl.id, decl.id.type);
        }
      };
    });
    instance.extend("parseAsyncArrowFromCallExpression", function(inner) {
      return function(node, call) {
        if (this.match(types2.colon)) {
          var oldNoAnonFunctionType = this.state.noAnonFunctionType;
          this.state.noAnonFunctionType = true;
          node.returnType = this.flowParseTypeAnnotation();
          this.state.noAnonFunctionType = oldNoAnonFunctionType;
        }
        return inner.call(this, node, call);
      };
    });
    instance.extend("shouldParseAsyncArrow", function(inner) {
      return function() {
        return this.match(types2.colon) || inner.call(this);
      };
    });
    instance.extend("parseMaybeAssign", function(inner) {
      return function() {
        var jsxError = null;
        for (var _len4 = arguments.length, args2 = Array(_len4), _key4 = 0;_key4 < _len4; _key4++) {
          args2[_key4] = arguments[_key4];
        }
        if (types2.jsxTagStart && this.match(types2.jsxTagStart)) {
          var state = this.state.clone();
          try {
            return inner.apply(this, args2);
          } catch (err) {
            if (err instanceof SyntaxError) {
              this.state = state;
              this.state.context.length -= 2;
              jsxError = err;
            } else {
              throw err;
            }
          }
        }
        if (jsxError != null || this.isRelational("<")) {
          var arrowExpression = undefined;
          var typeParameters = undefined;
          try {
            typeParameters = this.flowParseTypeParameterDeclaration();
            arrowExpression = inner.apply(this, args2);
            arrowExpression.typeParameters = typeParameters;
            arrowExpression.start = typeParameters.start;
            arrowExpression.loc.start = typeParameters.loc.start;
          } catch (err) {
            throw jsxError || err;
          }
          if (arrowExpression.type === "ArrowFunctionExpression") {
            return arrowExpression;
          } else if (jsxError != null) {
            throw jsxError;
          } else {
            this.raise(typeParameters.start, "Expected an arrow function after this type parameter declaration");
          }
        }
        return inner.apply(this, args2);
      };
    });
    instance.extend("parseArrow", function(inner) {
      return function(node) {
        if (this.match(types2.colon)) {
          var state = this.state.clone();
          try {
            var oldNoAnonFunctionType = this.state.noAnonFunctionType;
            this.state.noAnonFunctionType = true;
            var returnType = this.flowParseTypeAndPredicateAnnotation();
            this.state.noAnonFunctionType = oldNoAnonFunctionType;
            if (this.canInsertSemicolon())
              this.unexpected();
            if (!this.match(types2.arrow))
              this.unexpected();
            node.returnType = returnType;
          } catch (err) {
            if (err instanceof SyntaxError) {
              this.state = state;
            } else {
              throw err;
            }
          }
        }
        return inner.call(this, node);
      };
    });
    instance.extend("shouldParseArrow", function(inner) {
      return function() {
        return this.match(types2.colon) || inner.call(this);
      };
    });
  };
  /*! https://mths.be/fromcodepoint v0.2.1 by @mathias */
  var fromCodePoint = String.fromCodePoint;
  if (!fromCodePoint) {
    stringFromCharCode = String.fromCharCode;
    floor = Math.floor;
    fromCodePoint = function fromCodePoint2() {
      var MAX_SIZE = 16384;
      var codeUnits = [];
      var highSurrogate = undefined;
      var lowSurrogate = undefined;
      var index = -1;
      var length = arguments.length;
      if (!length) {
        return "";
      }
      var result = "";
      while (++index < length) {
        var codePoint = Number(arguments[index]);
        if (!isFinite(codePoint) || codePoint < 0 || codePoint > 1114111 || floor(codePoint) != codePoint) {
          throw RangeError("Invalid code point: " + codePoint);
        }
        if (codePoint <= 65535) {
          codeUnits.push(codePoint);
        } else {
          codePoint -= 65536;
          highSurrogate = (codePoint >> 10) + 55296;
          lowSurrogate = codePoint % 1024 + 56320;
          codeUnits.push(highSurrogate, lowSurrogate);
        }
        if (index + 1 == length || codeUnits.length > MAX_SIZE) {
          result += stringFromCharCode.apply(null, codeUnits);
          codeUnits.length = 0;
        }
      }
      return result;
    };
  }
  var stringFromCharCode;
  var floor;
  var fromCodePoint$1 = fromCodePoint;
  var XHTMLEntities = {
    quot: '"',
    amp: "&",
    apos: "'",
    lt: "<",
    gt: ">",
    nbsp: "\xA0",
    iexcl: "\xA1",
    cent: "\xA2",
    pound: "\xA3",
    curren: "\xA4",
    yen: "\xA5",
    brvbar: "\xA6",
    sect: "\xA7",
    uml: "\xA8",
    copy: "\xA9",
    ordf: "\xAA",
    laquo: "\xAB",
    not: "\xAC",
    shy: "\xAD",
    reg: "\xAE",
    macr: "\xAF",
    deg: "\xB0",
    plusmn: "\xB1",
    sup2: "\xB2",
    sup3: "\xB3",
    acute: "\xB4",
    micro: "\xB5",
    para: "\xB6",
    middot: "\xB7",
    cedil: "\xB8",
    sup1: "\xB9",
    ordm: "\xBA",
    raquo: "\xBB",
    frac14: "\xBC",
    frac12: "\xBD",
    frac34: "\xBE",
    iquest: "\xBF",
    Agrave: "\xC0",
    Aacute: "\xC1",
    Acirc: "\xC2",
    Atilde: "\xC3",
    Auml: "\xC4",
    Aring: "\xC5",
    AElig: "\xC6",
    Ccedil: "\xC7",
    Egrave: "\xC8",
    Eacute: "\xC9",
    Ecirc: "\xCA",
    Euml: "\xCB",
    Igrave: "\xCC",
    Iacute: "\xCD",
    Icirc: "\xCE",
    Iuml: "\xCF",
    ETH: "\xD0",
    Ntilde: "\xD1",
    Ograve: "\xD2",
    Oacute: "\xD3",
    Ocirc: "\xD4",
    Otilde: "\xD5",
    Ouml: "\xD6",
    times: "\xD7",
    Oslash: "\xD8",
    Ugrave: "\xD9",
    Uacute: "\xDA",
    Ucirc: "\xDB",
    Uuml: "\xDC",
    Yacute: "\xDD",
    THORN: "\xDE",
    szlig: "\xDF",
    agrave: "\xE0",
    aacute: "\xE1",
    acirc: "\xE2",
    atilde: "\xE3",
    auml: "\xE4",
    aring: "\xE5",
    aelig: "\xE6",
    ccedil: "\xE7",
    egrave: "\xE8",
    eacute: "\xE9",
    ecirc: "\xEA",
    euml: "\xEB",
    igrave: "\xEC",
    iacute: "\xED",
    icirc: "\xEE",
    iuml: "\xEF",
    eth: "\xF0",
    ntilde: "\xF1",
    ograve: "\xF2",
    oacute: "\xF3",
    ocirc: "\xF4",
    otilde: "\xF5",
    ouml: "\xF6",
    divide: "\xF7",
    oslash: "\xF8",
    ugrave: "\xF9",
    uacute: "\xFA",
    ucirc: "\xFB",
    uuml: "\xFC",
    yacute: "\xFD",
    thorn: "\xFE",
    yuml: "\xFF",
    OElig: "\u0152",
    oelig: "\u0153",
    Scaron: "\u0160",
    scaron: "\u0161",
    Yuml: "\u0178",
    fnof: "\u0192",
    circ: "\u02C6",
    tilde: "\u02DC",
    Alpha: "\u0391",
    Beta: "\u0392",
    Gamma: "\u0393",
    Delta: "\u0394",
    Epsilon: "\u0395",
    Zeta: "\u0396",
    Eta: "\u0397",
    Theta: "\u0398",
    Iota: "\u0399",
    Kappa: "\u039A",
    Lambda: "\u039B",
    Mu: "\u039C",
    Nu: "\u039D",
    Xi: "\u039E",
    Omicron: "\u039F",
    Pi: "\u03A0",
    Rho: "\u03A1",
    Sigma: "\u03A3",
    Tau: "\u03A4",
    Upsilon: "\u03A5",
    Phi: "\u03A6",
    Chi: "\u03A7",
    Psi: "\u03A8",
    Omega: "\u03A9",
    alpha: "\u03B1",
    beta: "\u03B2",
    gamma: "\u03B3",
    delta: "\u03B4",
    epsilon: "\u03B5",
    zeta: "\u03B6",
    eta: "\u03B7",
    theta: "\u03B8",
    iota: "\u03B9",
    kappa: "\u03BA",
    lambda: "\u03BB",
    mu: "\u03BC",
    nu: "\u03BD",
    xi: "\u03BE",
    omicron: "\u03BF",
    pi: "\u03C0",
    rho: "\u03C1",
    sigmaf: "\u03C2",
    sigma: "\u03C3",
    tau: "\u03C4",
    upsilon: "\u03C5",
    phi: "\u03C6",
    chi: "\u03C7",
    psi: "\u03C8",
    omega: "\u03C9",
    thetasym: "\u03D1",
    upsih: "\u03D2",
    piv: "\u03D6",
    ensp: "\u2002",
    emsp: "\u2003",
    thinsp: "\u2009",
    zwnj: "\u200C",
    zwj: "\u200D",
    lrm: "\u200E",
    rlm: "\u200F",
    ndash: "\u2013",
    mdash: "\u2014",
    lsquo: "\u2018",
    rsquo: "\u2019",
    sbquo: "\u201A",
    ldquo: "\u201C",
    rdquo: "\u201D",
    bdquo: "\u201E",
    dagger: "\u2020",
    Dagger: "\u2021",
    bull: "\u2022",
    hellip: "\u2026",
    permil: "\u2030",
    prime: "\u2032",
    Prime: "\u2033",
    lsaquo: "\u2039",
    rsaquo: "\u203A",
    oline: "\u203E",
    frasl: "\u2044",
    euro: "\u20AC",
    image: "\u2111",
    weierp: "\u2118",
    real: "\u211C",
    trade: "\u2122",
    alefsym: "\u2135",
    larr: "\u2190",
    uarr: "\u2191",
    rarr: "\u2192",
    darr: "\u2193",
    harr: "\u2194",
    crarr: "\u21B5",
    lArr: "\u21D0",
    uArr: "\u21D1",
    rArr: "\u21D2",
    dArr: "\u21D3",
    hArr: "\u21D4",
    forall: "\u2200",
    part: "\u2202",
    exist: "\u2203",
    empty: "\u2205",
    nabla: "\u2207",
    isin: "\u2208",
    notin: "\u2209",
    ni: "\u220B",
    prod: "\u220F",
    sum: "\u2211",
    minus: "\u2212",
    lowast: "\u2217",
    radic: "\u221A",
    prop: "\u221D",
    infin: "\u221E",
    ang: "\u2220",
    and: "\u2227",
    or: "\u2228",
    cap: "\u2229",
    cup: "\u222A",
    int: "\u222B",
    there4: "\u2234",
    sim: "\u223C",
    cong: "\u2245",
    asymp: "\u2248",
    ne: "\u2260",
    equiv: "\u2261",
    le: "\u2264",
    ge: "\u2265",
    sub: "\u2282",
    sup: "\u2283",
    nsub: "\u2284",
    sube: "\u2286",
    supe: "\u2287",
    oplus: "\u2295",
    otimes: "\u2297",
    perp: "\u22A5",
    sdot: "\u22C5",
    lceil: "\u2308",
    rceil: "\u2309",
    lfloor: "\u230A",
    rfloor: "\u230B",
    lang: "\u2329",
    rang: "\u232A",
    loz: "\u25CA",
    spades: "\u2660",
    clubs: "\u2663",
    hearts: "\u2665",
    diams: "\u2666"
  };
  var HEX_NUMBER = /^[\da-fA-F]+$/;
  var DECIMAL_NUMBER = /^\d+$/;
  types$1.j_oTag = new TokContext("<tag", false);
  types$1.j_cTag = new TokContext("</tag", false);
  types$1.j_expr = new TokContext("<tag>...</tag>", true, true);
  types2.jsxName = new TokenType("jsxName");
  types2.jsxText = new TokenType("jsxText", { beforeExpr: true });
  types2.jsxTagStart = new TokenType("jsxTagStart", { startsExpr: true });
  types2.jsxTagEnd = new TokenType("jsxTagEnd");
  types2.jsxTagStart.updateContext = function() {
    this.state.context.push(types$1.j_expr);
    this.state.context.push(types$1.j_oTag);
    this.state.exprAllowed = false;
  };
  types2.jsxTagEnd.updateContext = function(prevType) {
    var out = this.state.context.pop();
    if (out === types$1.j_oTag && prevType === types2.slash || out === types$1.j_cTag) {
      this.state.context.pop();
      this.state.exprAllowed = this.curContext() === types$1.j_expr;
    } else {
      this.state.exprAllowed = true;
    }
  };
  var pp$9 = Parser.prototype;
  pp$9.jsxReadToken = function() {
    var out = "";
    var chunkStart = this.state.pos;
    for (;; ) {
      if (this.state.pos >= this.input.length) {
        this.raise(this.state.start, "Unterminated JSX contents");
      }
      var ch = this.input.charCodeAt(this.state.pos);
      switch (ch) {
        case 60:
        case 123:
          if (this.state.pos === this.state.start) {
            if (ch === 60 && this.state.exprAllowed) {
              ++this.state.pos;
              return this.finishToken(types2.jsxTagStart);
            }
            return this.getTokenFromCode(ch);
          }
          out += this.input.slice(chunkStart, this.state.pos);
          return this.finishToken(types2.jsxText, out);
        case 38:
          out += this.input.slice(chunkStart, this.state.pos);
          out += this.jsxReadEntity();
          chunkStart = this.state.pos;
          break;
        default:
          if (isNewLine(ch)) {
            out += this.input.slice(chunkStart, this.state.pos);
            out += this.jsxReadNewLine(true);
            chunkStart = this.state.pos;
          } else {
            ++this.state.pos;
          }
      }
    }
  };
  pp$9.jsxReadNewLine = function(normalizeCRLF) {
    var ch = this.input.charCodeAt(this.state.pos);
    var out = undefined;
    ++this.state.pos;
    if (ch === 13 && this.input.charCodeAt(this.state.pos) === 10) {
      ++this.state.pos;
      out = normalizeCRLF ? `
` : `\r
`;
    } else {
      out = String.fromCharCode(ch);
    }
    ++this.state.curLine;
    this.state.lineStart = this.state.pos;
    return out;
  };
  pp$9.jsxReadString = function(quote) {
    var out = "";
    var chunkStart = ++this.state.pos;
    for (;; ) {
      if (this.state.pos >= this.input.length) {
        this.raise(this.state.start, "Unterminated string constant");
      }
      var ch = this.input.charCodeAt(this.state.pos);
      if (ch === quote)
        break;
      if (ch === 38) {
        out += this.input.slice(chunkStart, this.state.pos);
        out += this.jsxReadEntity();
        chunkStart = this.state.pos;
      } else if (isNewLine(ch)) {
        out += this.input.slice(chunkStart, this.state.pos);
        out += this.jsxReadNewLine(false);
        chunkStart = this.state.pos;
      } else {
        ++this.state.pos;
      }
    }
    out += this.input.slice(chunkStart, this.state.pos++);
    return this.finishToken(types2.string, out);
  };
  pp$9.jsxReadEntity = function() {
    var str = "";
    var count = 0;
    var entity = undefined;
    var ch = this.input[this.state.pos];
    var startPos = ++this.state.pos;
    while (this.state.pos < this.input.length && count++ < 10) {
      ch = this.input[this.state.pos++];
      if (ch === ";") {
        if (str[0] === "#") {
          if (str[1] === "x") {
            str = str.substr(2);
            if (HEX_NUMBER.test(str))
              entity = fromCodePoint$1(parseInt(str, 16));
          } else {
            str = str.substr(1);
            if (DECIMAL_NUMBER.test(str))
              entity = fromCodePoint$1(parseInt(str, 10));
          }
        } else {
          entity = XHTMLEntities[str];
        }
        break;
      }
      str += ch;
    }
    if (!entity) {
      this.state.pos = startPos;
      return "&";
    }
    return entity;
  };
  pp$9.jsxReadWord = function() {
    var ch = undefined;
    var start = this.state.pos;
    do {
      ch = this.input.charCodeAt(++this.state.pos);
    } while (isIdentifierChar(ch) || ch === 45);
    return this.finishToken(types2.jsxName, this.input.slice(start, this.state.pos));
  };
  function getQualifiedJSXName(object) {
    if (object.type === "JSXIdentifier") {
      return object.name;
    }
    if (object.type === "JSXNamespacedName") {
      return object.namespace.name + ":" + object.name.name;
    }
    if (object.type === "JSXMemberExpression") {
      return getQualifiedJSXName(object.object) + "." + getQualifiedJSXName(object.property);
    }
  }
  pp$9.jsxParseIdentifier = function() {
    var node = this.startNode();
    if (this.match(types2.jsxName)) {
      node.name = this.state.value;
    } else if (this.state.type.keyword) {
      node.name = this.state.type.keyword;
    } else {
      this.unexpected();
    }
    this.next();
    return this.finishNode(node, "JSXIdentifier");
  };
  pp$9.jsxParseNamespacedName = function() {
    var startPos = this.state.start;
    var startLoc = this.state.startLoc;
    var name = this.jsxParseIdentifier();
    if (!this.eat(types2.colon))
      return name;
    var node = this.startNodeAt(startPos, startLoc);
    node.namespace = name;
    node.name = this.jsxParseIdentifier();
    return this.finishNode(node, "JSXNamespacedName");
  };
  pp$9.jsxParseElementName = function() {
    var startPos = this.state.start;
    var startLoc = this.state.startLoc;
    var node = this.jsxParseNamespacedName();
    while (this.eat(types2.dot)) {
      var newNode = this.startNodeAt(startPos, startLoc);
      newNode.object = node;
      newNode.property = this.jsxParseIdentifier();
      node = this.finishNode(newNode, "JSXMemberExpression");
    }
    return node;
  };
  pp$9.jsxParseAttributeValue = function() {
    var node = undefined;
    switch (this.state.type) {
      case types2.braceL:
        node = this.jsxParseExpressionContainer();
        if (node.expression.type === "JSXEmptyExpression") {
          this.raise(node.start, "JSX attributes must only be assigned a non-empty expression");
        } else {
          return node;
        }
      case types2.jsxTagStart:
      case types2.string:
        node = this.parseExprAtom();
        node.extra = null;
        return node;
      default:
        this.raise(this.state.start, "JSX value should be either an expression or a quoted JSX text");
    }
  };
  pp$9.jsxParseEmptyExpression = function() {
    var node = this.startNodeAt(this.state.lastTokEnd, this.state.lastTokEndLoc);
    return this.finishNodeAt(node, "JSXEmptyExpression", this.state.start, this.state.startLoc);
  };
  pp$9.jsxParseSpreadChild = function() {
    var node = this.startNode();
    this.expect(types2.braceL);
    this.expect(types2.ellipsis);
    node.expression = this.parseExpression();
    this.expect(types2.braceR);
    return this.finishNode(node, "JSXSpreadChild");
  };
  pp$9.jsxParseExpressionContainer = function() {
    var node = this.startNode();
    this.next();
    if (this.match(types2.braceR)) {
      node.expression = this.jsxParseEmptyExpression();
    } else {
      node.expression = this.parseExpression();
    }
    this.expect(types2.braceR);
    return this.finishNode(node, "JSXExpressionContainer");
  };
  pp$9.jsxParseAttribute = function() {
    var node = this.startNode();
    if (this.eat(types2.braceL)) {
      this.expect(types2.ellipsis);
      node.argument = this.parseMaybeAssign();
      this.expect(types2.braceR);
      return this.finishNode(node, "JSXSpreadAttribute");
    }
    node.name = this.jsxParseNamespacedName();
    node.value = this.eat(types2.eq) ? this.jsxParseAttributeValue() : null;
    return this.finishNode(node, "JSXAttribute");
  };
  pp$9.jsxParseOpeningElementAt = function(startPos, startLoc) {
    var node = this.startNodeAt(startPos, startLoc);
    node.attributes = [];
    node.name = this.jsxParseElementName();
    while (!this.match(types2.slash) && !this.match(types2.jsxTagEnd)) {
      node.attributes.push(this.jsxParseAttribute());
    }
    node.selfClosing = this.eat(types2.slash);
    this.expect(types2.jsxTagEnd);
    return this.finishNode(node, "JSXOpeningElement");
  };
  pp$9.jsxParseClosingElementAt = function(startPos, startLoc) {
    var node = this.startNodeAt(startPos, startLoc);
    node.name = this.jsxParseElementName();
    this.expect(types2.jsxTagEnd);
    return this.finishNode(node, "JSXClosingElement");
  };
  pp$9.jsxParseElementAt = function(startPos, startLoc) {
    var node = this.startNodeAt(startPos, startLoc);
    var children = [];
    var openingElement = this.jsxParseOpeningElementAt(startPos, startLoc);
    var closingElement = null;
    if (!openingElement.selfClosing) {
      contents:
        for (;; ) {
          switch (this.state.type) {
            case types2.jsxTagStart:
              startPos = this.state.start;
              startLoc = this.state.startLoc;
              this.next();
              if (this.eat(types2.slash)) {
                closingElement = this.jsxParseClosingElementAt(startPos, startLoc);
                break contents;
              }
              children.push(this.jsxParseElementAt(startPos, startLoc));
              break;
            case types2.jsxText:
              children.push(this.parseExprAtom());
              break;
            case types2.braceL:
              if (this.lookahead().type === types2.ellipsis) {
                children.push(this.jsxParseSpreadChild());
              } else {
                children.push(this.jsxParseExpressionContainer());
              }
              break;
            default:
              this.unexpected();
          }
        }
      if (getQualifiedJSXName(closingElement.name) !== getQualifiedJSXName(openingElement.name)) {
        this.raise(closingElement.start, "Expected corresponding JSX closing tag for <" + getQualifiedJSXName(openingElement.name) + ">");
      }
    }
    node.openingElement = openingElement;
    node.closingElement = closingElement;
    node.children = children;
    if (this.match(types2.relational) && this.state.value === "<") {
      this.raise(this.state.start, "Adjacent JSX elements must be wrapped in an enclosing tag");
    }
    return this.finishNode(node, "JSXElement");
  };
  pp$9.jsxParseElement = function() {
    var startPos = this.state.start;
    var startLoc = this.state.startLoc;
    this.next();
    return this.jsxParseElementAt(startPos, startLoc);
  };
  var jsxPlugin = function(instance) {
    instance.extend("parseExprAtom", function(inner) {
      return function(refShortHandDefaultPos) {
        if (this.match(types2.jsxText)) {
          var node = this.parseLiteral(this.state.value, "JSXText");
          node.extra = null;
          return node;
        } else if (this.match(types2.jsxTagStart)) {
          return this.jsxParseElement();
        } else {
          return inner.call(this, refShortHandDefaultPos);
        }
      };
    });
    instance.extend("readToken", function(inner) {
      return function(code) {
        if (this.state.inPropertyName)
          return inner.call(this, code);
        var context = this.curContext();
        if (context === types$1.j_expr) {
          return this.jsxReadToken();
        }
        if (context === types$1.j_oTag || context === types$1.j_cTag) {
          if (isIdentifierStart(code)) {
            return this.jsxReadWord();
          }
          if (code === 62) {
            ++this.state.pos;
            return this.finishToken(types2.jsxTagEnd);
          }
          if ((code === 34 || code === 39) && context === types$1.j_oTag) {
            return this.jsxReadString(code);
          }
        }
        if (code === 60 && this.state.exprAllowed) {
          ++this.state.pos;
          return this.finishToken(types2.jsxTagStart);
        }
        return inner.call(this, code);
      };
    });
    instance.extend("updateContext", function(inner) {
      return function(prevType) {
        if (this.match(types2.braceL)) {
          var curContext = this.curContext();
          if (curContext === types$1.j_oTag) {
            this.state.context.push(types$1.braceExpression);
          } else if (curContext === types$1.j_expr) {
            this.state.context.push(types$1.templateQuasi);
          } else {
            inner.call(this, prevType);
          }
          this.state.exprAllowed = true;
        } else if (this.match(types2.slash) && prevType === types2.jsxTagStart) {
          this.state.context.length -= 2;
          this.state.context.push(types$1.j_cTag);
          this.state.exprAllowed = false;
        } else {
          return inner.call(this, prevType);
        }
      };
    });
  };
  plugins.estree = estreePlugin;
  plugins.flow = flowPlugin;
  plugins.jsx = jsxPlugin;
  function parse(input, options) {
    return new Parser(options, input).parse();
  }
  function parseExpression(input, options) {
    var parser = new Parser(options, input);
    if (parser.options.strictMode) {
      parser.state.strict = true;
    }
    return parser.getExpression();
  }
  exports.parse = parse;
  exports.parseExpression = parseExpression;
  exports.tokTypes = types2;
});

// node_modules/bash-parser/src/modes/posix/rules/arithmetic-expansion.js
var require_arithmetic_expansion = __commonJS((exports, module) => {
  var map = require_map_iterable();
  var babylon = require_lib();
  var MagicString = require_magic_string_cjs();
  var tokens = require_tokens();
  var fieldSplitting = require_field_splitting();
  function parseArithmeticAST(xp) {
    let AST;
    try {
      AST = babylon.parse(xp.expression);
    } catch (err) {
      throw new SyntaxError(`Cannot parse arithmetic expression "${xp.expression}": ${err.message}`);
    }
    const expression = AST.program.body[0].expression;
    if (expression === undefined) {
      throw new SyntaxError(`Cannot parse arithmetic expression "${xp.expression}": Not an expression`);
    }
    return JSON.parse(JSON.stringify(expression));
  }
  var arithmeticExpansion = () => map((token) => {
    if (token.is("WORD") || token.is("ASSIGNMENT_WORD")) {
      if (!token.expansion || token.expansion.length === 0) {
        return token;
      }
      return tokens.setExpansions(token, token.expansion.map((xp) => {
        if (xp.type === "arithmetic_expansion") {
          return Object.assign({}, xp, { arithmeticAST: parseArithmeticAST(xp) });
        }
        return xp;
      }));
    }
    return token;
  });
  arithmeticExpansion.resolve = (options) => map((token) => {
    if (options.runArithmeticExpression && token.expansion) {
      const value = token.value;
      const magic = new MagicString(value);
      for (const xp of token.expansion) {
        if (xp.type === "arithmetic_expansion") {
          const result = options.runArithmeticExpression(xp);
          magic.overwrite(xp.loc.start, xp.loc.end + 1, fieldSplitting.mark(result, value, options));
          xp.resolved = true;
        }
      }
      return token.alterValue(magic.toString());
    }
    return token;
  });
  module.exports = arithmeticExpansion;
});

// node_modules/bash-parser/src/modes/posix/rules/alias-substitution.js
var require_alias_substitution2 = __commonJS((exports, module) => {
  var compose = require_compose_function();
  var identity = require_identity_function();
  var map = require_map_iterable();
  var merge = require_transform_spread_iterable();
  var tokens = require_tokens();
  var expandAlias = (preAliasLexer, resolveAlias) => {
    function* tryExpandToken(token, expandingAliases) {
      if (expandingAliases.indexOf(token.value) !== -1 || !token._.maybeSimpleCommandName) {
        yield token;
        return;
      }
      const result = resolveAlias(token.value);
      if (result === undefined) {
        yield token;
      } else {
        for (const newToken of preAliasLexer(result)) {
          if (newToken.is("WORD")) {
            yield* tryExpandToken(newToken, expandingAliases.concat(token.value));
          } else if (!newToken.is("EOF")) {
            yield newToken;
          }
        }
      }
    }
    return {
      WORD: (tk) => {
        return Array.from(tryExpandToken(tk, []));
      }
    };
  };
  module.exports = (options, mode, previousPhases) => {
    if (typeof options.resolveAlias !== "function") {
      return identity;
    }
    const preAliasLexer = compose.apply(null, previousPhases.reverse());
    const visitor = expandAlias(preAliasLexer, options.resolveAlias);
    return compose(merge, map(tokens.applyTokenizerVisitor(visitor)));
  };
});

// node_modules/to-no-case/index.js
var require_to_no_case = __commonJS((exports, module) => {
  module.exports = toNoCase;
  var hasSpace = /\s/;
  var hasSeparator = /(_|-|\.|:)/;
  var hasCamel = /([a-z][A-Z]|[A-Z][a-z])/;
  function toNoCase(string) {
    if (hasSpace.test(string))
      return string.toLowerCase();
    if (hasSeparator.test(string))
      return (unseparate(string) || string).toLowerCase();
    if (hasCamel.test(string))
      return uncamelize(string).toLowerCase();
    return string.toLowerCase();
  }
  var separatorSplitter = /[\W_]+(.|$)/g;
  function unseparate(string) {
    return string.replace(separatorSplitter, function(m, next) {
      return next ? " " + next : "";
    });
  }
  var camelSplitter = /(.)([A-Z]+)/g;
  function uncamelize(string) {
    return string.replace(camelSplitter, function(m, previous, uppers) {
      return previous + " " + uppers.toLowerCase().split("").join(" ");
    });
  }
});

// node_modules/to-space-case/index.js
var require_to_space_case = __commonJS((exports, module) => {
  var clean = require_to_no_case();
  module.exports = toSpaceCase;
  function toSpaceCase(string) {
    return clean(string).replace(/[\W_]+(.|$)/g, function(matches, match) {
      return match ? " " + match : "";
    }).trim();
  }
});

// node_modules/to-pascal-case/index.js
var require_to_pascal_case = __commonJS((exports, module) => {
  var space = require_to_space_case();
  module.exports = toPascalCase;
  function toPascalCase(string) {
    return space(string).replace(/(?:^|\s)(\w)/g, function(matches, letter) {
      return letter.toUpperCase();
    });
  }
});

// node_modules/bash-parser/src/modes/posix/rules/default-node-type.js
var require_default_node_type = __commonJS((exports, module) => {
  var toPascal = require_to_pascal_case();
  var map = require_map_iterable();
  module.exports = () => map((token) => {
    const tk = Object.assign({}, token);
    if (tk.type) {
      tk.originalType = token.type;
      if (token.is("WORD") || token.is("NAME") || token.is("ASSIGNMENT_WORD")) {
        tk.type = toPascal(tk.type);
      } else {
        tk.type = token.type.toLowerCase();
      }
      for (const xp of tk.expansion || []) {
        xp.type = toPascal(xp.type);
      }
      delete tk._;
    }
    return tk;
  });
});

// node_modules/bash-parser/src/modes/posix/rules/tilde-expanding.js
var require_tilde_expanding = __commonJS((exports, module) => {
  var map = require_map_iterable();
  var tokens = require_tokens();
  var replace = (text, resolveHomeUser) => {
    let replaced = false;
    let result = text.replace(/^~([^\/]*)\//, (match, p1) => {
      replaced = true;
      return resolveHomeUser(p1 || null) + "/";
    });
    if (!replaced) {
      result = text.replace(/^~(.*)$/, (match, p1) => {
        return resolveHomeUser(p1 || null);
      });
    }
    return result;
  };
  module.exports = (options) => map((token) => {
    if (token.is("WORD") && typeof options.resolveHomeUser === "function") {
      return tokens.setValue(token, replace(token.value, options.resolveHomeUser));
    }
    if (token.is("ASSIGNMENT_WORD") && typeof options.resolveHomeUser === "function") {
      const parts = token.value.split("=", 2);
      const target = parts[0];
      const sourceParts = parts[1];
      const source = sourceParts.split(":").map((text) => replace(text, options.resolveHomeUser)).join(":");
      return tokens.setValue(token, target + "=" + source);
    }
    return token;
  });
});

// node_modules/bash-parser/src/modes/posix/rules/path-expansion.js
var require_path_expansion = __commonJS((exports, module) => {
  var map = require_map_iterable();
  var tokens = require_tokens();
  module.exports = (options) => map((token) => {
    if (token.is("WORD") && typeof options.resolvePath === "function") {
      return tokens.setValue(token, options.resolvePath(token.value));
    }
    if (token.is("ASSIGNMENT_WORD") && typeof options.resolvePath === "function") {
      const parts = token.value.split("=");
      return tokens.setValue(token, parts[0] + "=" + options.resolvePath(parts[1]));
    }
    return token;
  });
});

// node_modules/shell-quote-word/index.js
var require_shell_quote_word = __commonJS((exports, module) => {
  var META = "|&;()<> \\t";
  var BAREWORD = `(\\\\['"` + META + `]|[^\\s'"` + META + "])+";
  var SINGLE_QUOTE = '"((\\\\"|[^"])*?)"';
  var DOUBLE_QUOTE = "'((\\\\'|[^'])*?)'";
  var TOKEN = "";
  for (i = 0;i < 4; i++) {
    TOKEN += (Math.pow(16, 8) * Math.random()).toString(16);
  }
  var i;
  module.exports = function parse(s) {
    var chunker = new RegExp([
      "(" + BAREWORD + "|" + SINGLE_QUOTE + "|" + DOUBLE_QUOTE + ")*"
    ].join("|"), "g");
    var match = s.match(chunker).filter(Boolean);
    var commented = false;
    if (!match) {
      return [];
    }
    return match.map((s2, j) => {
      if (commented) {
        return;
      }
      var SQ = "'";
      var DQ = '"';
      var BS = "\\";
      var quote = false;
      var esc = false;
      var out = "";
      for (var i2 = 0, len = s2.length;i2 < len; i2++) {
        var c = s2.charAt(i2);
        if (esc) {
          out += c;
          esc = false;
        } else if (quote) {
          if (c === quote) {
            quote = false;
          } else if (quote === SQ) {
            out += c;
          } else if (c === BS) {
            i2 += 1;
            c = s2.charAt(i2);
            if (c === DQ || c === BS) {
              out += c;
            } else {
              out += BS + c;
            }
          } else {
            out += c;
          }
        } else if (c === DQ || c === SQ) {
          quote = c;
        } else if (RegExp("^#$").test(c)) {
          commented = true;
          if (out.length) {
            return [out, { comment: s2.slice(i2 + 1) + match.slice(j + 1).join(" ") }];
          }
          return [{ comment: s2.slice(i2 + 1) + match.slice(j + 1).join(" ") }];
        } else if (c === BS) {
          esc = true;
        } else {
          out += c;
        }
      }
      return out;
    }).reduce((prev, arg) => {
      if (arg === undefined) {
        return prev;
      }
      return prev.concat(arg);
    }, []);
  };
});

// node_modules/string.fromcodepoint/fromcodepoint.js
var exports_fromcodepoint = {};
var init_fromcodepoint = __esm(() => {
  /*! http://mths.be/fromcodepoint v0.2.1 by @mathias */
  if (!String.fromCodePoint) {
    (function() {
      var defineProperty = function() {
        try {
          var object = {};
          var $defineProperty = Object.defineProperty;
          var result = $defineProperty(object, object, object) && $defineProperty;
        } catch (error) {}
        return result;
      }();
      var stringFromCharCode = String.fromCharCode;
      var floor = Math.floor;
      var fromCodePoint = function(_) {
        var MAX_SIZE = 16384;
        var codeUnits = [];
        var highSurrogate;
        var lowSurrogate;
        var index = -1;
        var length = arguments.length;
        if (!length) {
          return "";
        }
        var result = "";
        while (++index < length) {
          var codePoint = Number(arguments[index]);
          if (!isFinite(codePoint) || codePoint < 0 || codePoint > 1114111 || floor(codePoint) != codePoint) {
            throw RangeError("Invalid code point: " + codePoint);
          }
          if (codePoint <= 65535) {
            codeUnits.push(codePoint);
          } else {
            codePoint -= 65536;
            highSurrogate = (codePoint >> 10) + 55296;
            lowSurrogate = codePoint % 1024 + 56320;
            codeUnits.push(highSurrogate, lowSurrogate);
          }
          if (index + 1 == length || codeUnits.length > MAX_SIZE) {
            result += stringFromCharCode.apply(null, codeUnits);
            codeUnits.length = 0;
          }
        }
        return result;
      };
      if (defineProperty) {
        defineProperty(String, "fromCodePoint", {
          value: fromCodePoint,
          configurable: true,
          writable: true
        });
      } else {
        String.fromCodePoint = fromCodePoint;
      }
    })();
  }
});

// node_modules/unescape-js/dist/index.js
var require_dist = __commonJS((exports, module) => {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  init_fromcodepoint();
  var jsEscapeRegex = /\\(u\{([0-9A-Fa-f]+)\}|u([0-9A-Fa-f]{4})|x([0-9A-Fa-f]{2})|([1-7][0-7]{0,2}|[0-7]{2,3})|(['"tbrnfv0\\]))|\\U([0-9A-Fa-f]{8})/g;
  var usualEscapeSequences = {
    "0": "\x00",
    b: "\b",
    f: "\f",
    n: `
`,
    r: "\r",
    t: "\t",
    v: "\v",
    "'": "'",
    '"': '"',
    "\\": "\\"
  };
  var fromHex = function fromHex2(str) {
    return String.fromCodePoint(parseInt(str, 16));
  };
  var fromOct = function fromOct2(str) {
    return String.fromCodePoint(parseInt(str, 8));
  };
  var _default = function _default2(string) {
    return string.replace(jsEscapeRegex, function(_, __, varHex, longHex, shortHex, octal, specialCharacter, python) {
      if (varHex !== undefined) {
        return fromHex(varHex);
      } else if (longHex !== undefined) {
        return fromHex(longHex);
      } else if (shortHex !== undefined) {
        return fromHex(shortHex);
      } else if (octal !== undefined) {
        return fromOct(octal);
      } else if (python !== undefined) {
        return fromHex(python);
      } else {
        return usualEscapeSequences[specialCharacter];
      }
    });
  };
  exports.default = _default;
  module.exports = exports.default;
});

// node_modules/bash-parser/src/modes/posix/rules/quote-removal.js
var require_quote_removal = __commonJS((exports, module) => {
  var parse = require_shell_quote_word();
  var unescape = require_dist();
  var map = require_map_iterable();
  var tokens = require_tokens();
  function unquote(text) {
    const unquoted = parse(text);
    if (unquoted.length === 0) {
      return text;
    }
    if (unquoted[0].comment) {
      return "";
    }
    return unescape(unquoted[0]);
  }
  function unresolvedExpansions(token) {
    if (!token.expansion) {
      return false;
    }
    const unresolved = token.expansion.filter((xp) => !xp.resolved);
    return unresolved.length > 0;
  }
  module.exports = () => map((token) => {
    if (token.is("WORD") || token.is("ASSIGNMENT_WORD")) {
      if (!unresolvedExpansions(token)) {
        return tokens.setValue(token, unquote(token.value));
      }
    }
    return token;
  });
});

// node_modules/iterable-lookahead/index.js
var require_iterable_lookahead = __commonJS((exports, module) => {
  function lookahead(iterable, size) {
    if (size === undefined) {
      size = 1;
    }
    if (typeof size !== "number" && !(size instanceof Number)) {
      throw new TypeError("Size argument must be a number");
    }
    if (size < 1) {
      throw new RangeError("Size argument must be greater than 0");
    }
    const behindCache = new Array(size + 1);
    const aheadCache = [];
    const iterator = iterable[Symbol.iterator]();
    return {
      ahead(idx) {
        if (idx > size) {
          throw new RangeError(`Cannot look ahead of ${idx} position, currently depth is ${size}`);
        }
        if (idx < 1) {
          throw new RangeError("Look ahead index must be greater than 0");
        }
        return aheadCache[idx - 1];
      },
      behind(idx) {
        if (idx > size) {
          throw new RangeError(`Cannot look behind of ${idx} position, currently depth is ${size}`);
        }
        if (idx < 1) {
          throw new RangeError("Look behind index must be greater than 0");
        }
        return behindCache[idx];
      },
      [Symbol.iterator]() {
        return this;
      },
      next() {
        let item = iterator.next();
        while (!item.done && aheadCache.length <= size) {
          aheadCache.push(item.value);
          item = iterator.next();
        }
        if (!item.done) {
          aheadCache.push(item.value);
        }
        if (item.done && aheadCache.length === 0) {
          return { done: true };
        }
        const value = aheadCache.shift();
        behindCache.unshift(value);
        behindCache.pop();
        return { done: false, value };
      }
    };
  }
  lookahead.depth = (size) => (iterable) => lookahead(iterable, size);
  lookahead.spread = function lookaheadSpread(iterable, size) {
    const it = lookahead(iterable, size);
    it._next = it.next;
    it.next = function() {
      let item = this._next();
      if (!item.done) {
        item.value = [item.value, it];
      }
      return item;
    };
    return it;
  };
  module.exports = lookahead;
});

// node_modules/bash-parser/src/modes/posix/rules/identify-simplecommand-names.js
var require_identify_simplecommand_names = __commonJS((exports, module) => {
  var lookahead = require_iterable_lookahead();
  var compose = require_compose_function();
  var map = require_map_iterable();
  var isValidName = require_is_valid_name();
  function couldEndSimpleCommand(scTk) {
    return scTk && (scTk.is("SEPARATOR_OP") || scTk.is("NEWLINE") || scTk.is("NEWLINE_LIST") || scTk.value === ";" || scTk.is("PIPE") || scTk.is("OR_IF") || scTk.is("PIPE") || scTk.is("AND_IF"));
  }
  function couldBeCommandName(tk) {
    return tk && tk.is("WORD") && isValidName(tk.value);
  }
  module.exports = (options, mode) => compose(map((tk, idx, iterable) => {
    if (tk._.maybeStartOfSimpleCommand) {
      if (couldBeCommandName(tk)) {
        tk._.maybeSimpleCommandName = true;
      } else {
        const next = iterable.ahead(1);
        if (next && !couldEndSimpleCommand(next)) {
          next._.commandNameNotFoundYet = true;
        }
      }
    }
    if (tk._.commandNameNotFoundYet) {
      const last = iterable.behind(1);
      if (!mode.enums.IOFileOperators.isOperator(last) && couldBeCommandName(tk)) {
        tk._.maybeSimpleCommandName = true;
      } else {
        const next = iterable.ahead(1);
        if (next && !couldEndSimpleCommand(next)) {
          next._.commandNameNotFoundYet = true;
        }
      }
      delete tk._.commandNameNotFoundYet;
    }
    return tk;
  }), lookahead);
});

// node_modules/bash-parser/src/modes/posix/rules/identify-maybe-simple-commands.js
var require_identify_maybe_simple_commands = __commonJS((exports, module) => {
  var values = require_object_values();
  var compose = require_compose_function();
  var map = require_map_iterable();
  var lookahead = require_iterable_lookahead();
  module.exports = function identifyMaybeSimpleCommands(options, mode) {
    return compose(map((tk, idx, iterable) => {
      const last = iterable.behind(1) || { EMPTY: true, is: (type) => type === "EMPTY" };
      tk._.maybeStartOfSimpleCommand = Boolean(last.is("EMPTY") || last.is("SEPARATOR_OP") || last.is("OPEN_PAREN") || last.is("CLOSE_PAREN") || last.is("NEWLINE") || last.is("NEWLINE_LIST") || last.is("TOKEN") === ";" || last.is("PIPE") || last.is("DSEMI") || last.is("OR_IF") || last.is("PIPE") || last.is("AND_IF") || !last.is("For") && !last.is("In") && !last.is("Case") && values(mode.enums.reservedWords).some((word) => last.is(word)));
      return tk;
    }), lookahead);
  };
});

// node_modules/bash-parser/src/modes/posix/rules/operator-tokens.js
var require_operator_tokens = __commonJS((exports, module) => {
  var hasOwnProperty = require_has_own_property();
  var map = require_map_iterable();
  var tokens = require_tokens();
  var reduceToOperatorTokenVisitor = (operators) => ({
    OPERATOR(tk) {
      if (hasOwnProperty(operators, tk.value)) {
        return tokens.changeTokenType(tk, operators[tk.value], tk.value);
      }
      return tk;
    }
  });
  module.exports = (options, mode) => map(tokens.applyTokenizerVisitor(reduceToOperatorTokenVisitor(mode.enums.operators)));
});

// node_modules/bash-parser/src/modes/posix/rules/reserved-words.js
var require_reserved_words = __commonJS((exports, module) => {
  var hasOwnProperty = require_has_own_property();
  var values = require_object_values();
  var compose = require_compose_function();
  var map = require_map_iterable();
  var lookahead = require_iterable_lookahead();
  function isValidReservedWordPosition(tk, iterable, words) {
    const last = iterable.behind(1) || { EMPTY: true, is: (type) => type === "EMPTY" };
    const twoAgo = iterable.behind(2) || { EMPTY: true, is: (type) => type === "EMPTY" };
    const startOfCommand = last.is("EMPTY") || last.is("SEPARATOR_OP") || last.is("OPEN_PAREN") || last.is("CLOSE_PAREN") || last.is("NEWLINE") || last.is("NEWLINE_LIST") || last.is("DSEMI") || last.value === ";" || last.is("PIPE") || last.is("OR_IF") || last.is("PIPE") || last.is("AND_IF");
    const lastIsReservedWord = !last.value === "for" && !last.value === "in" && !last.value === "case" && values(words).some((word) => last.is(word));
    const thirdInCase = twoAgo.value === "case" && tk.is("TOKEN") && tk.value.toLowerCase() === "in";
    const thirdInFor = twoAgo.value === "for" && tk.is("TOKEN") && (tk.value.toLowerCase() === "in" || tk.value.toLowerCase() === "do");
    return tk.value === "}" || startOfCommand || lastIsReservedWord || thirdInFor || thirdInCase;
  }
  module.exports = function reservedWords(options, mode) {
    return compose(map((tk, idx, iterable) => {
      if (isValidReservedWordPosition(tk, iterable, mode.enums.reservedWords) && hasOwnProperty(mode.enums.reservedWords, tk.value)) {
        return tk.changeTokenType(mode.enums.reservedWords[tk.value], tk.value);
      }
      if (tk.is("TOKEN")) {
        return tk.changeTokenType("WORD", tk.value);
      }
      return tk;
    }), lookahead.depth(2));
  };
});

// node_modules/filter-iterator/index.js
var require_filter_iterator = __commonJS((exports, module) => {
  module.exports = filterIterator;
  function* filterIterator(xs, pred) {
    for (let x of xs) {
      if (pred(x))
        yield x;
    }
  }
});

// node_modules/reverse-arguments/index.js
var require_reverse_arguments = __commonJS((exports, module) => {
  module.exports = function reverseArgs(fn2, scope) {
    return function() {
      var args2 = Array.prototype.slice.call(arguments);
      return fn2.apply(scope || this, args2.reverse());
    };
  };
});

// node_modules/bash-parser/src/utils/filter.js
var require_filter = __commonJS((exports, module) => {
  var filterIterator = require_filter_iterator();
  var reverse = require_reverse_arguments();
  var curry = require_curry();
  var filter = curry.to(2, reverse(filterIterator));
  module.exports = filter;
});

// node_modules/bash-parser/src/utils/non-null.js
var require_non_null = __commonJS((exports, module) => {
  var filter = require_filter();
  var nonNull = (tk) => {
    return tk !== null;
  };
  module.exports = filter(nonNull);
  filter.predicate = nonNull;
});

// node_modules/bash-parser/src/modes/posix/rules/separator.js
var require_separator = __commonJS((exports, module) => {
  var compose = require_compose_function();
  var map = require_map_iterable();
  var lookahead = require_iterable_lookahead();
  var tokens = require_tokens();
  var filterNonNull = require_non_null();
  var isSeparator = (tk) => tk && (tk.is("NEWLINE") || tk.is("NEWLINE_LIST") || tk.is("AND") || tk.is("SEMICOLON") || tk.is("OPERATOR") && tk.value === ";" || tk.is("OPERATOR") && tk.value === "&");
  function toSeparatorToken(tk, iterable) {
    if (skipJoined(tk) === null) {
      return null;
    }
    let newTk = tokens.changeTokenType(tk, "SEPARATOR_OP", tk.value);
    let i = 1;
    let nextTk = iterable.ahead(i);
    while (isSeparator(nextTk)) {
      nextTk._.joinedToSeparator = true;
      i++;
      newTk = newTk.appendTo(nextTk.value);
      nextTk = iterable.ahead(i);
    }
    return newTk;
  }
  function skipJoined(tk) {
    if (tk._.joinedToSeparator) {
      return null;
    }
    return tk;
  }
  var AccumulateSeparators = {
    NEWLINE: skipJoined,
    NEWLINE_LIST: skipJoined,
    SEMICOLON: toSeparatorToken,
    AND: toSeparatorToken,
    OPERATOR: (tk, iterable) => tk.value === "&" || tk.value === ";" ? toSeparatorToken(tk, iterable) : tk
  };
  module.exports = () => compose(filterNonNull, map(tokens.applyTokenizerVisitor(AccumulateSeparators)), lookahead.depth(10));
});

// node_modules/bash-parser/src/modes/posix/rules/linebreak-in.js
var require_linebreak_in = __commonJS((exports, module) => {
  var compose = require_compose_function();
  var map = require_map_iterable();
  var lookahead = require_iterable_lookahead();
  var tokens = require_tokens();
  var filterNonNull = require_non_null();
  var ReplaceWithLineBreakIn = {
    NEWLINE_LIST(tk, iterable) {
      const nextToken = iterable.ahead(1) || tokens.mkToken("EMPTY");
      if (nextToken.is("In")) {
        return tokens.changeTokenType(tk, "LINEBREAK_IN", `
in`);
      }
      return tk;
    },
    In(tk, iterable) {
      const lastToken = iterable.behind(1) || tokens.mkToken("EMPTY");
      if (lastToken.is("NEWLINE_LIST")) {
        return null;
      }
      return tk;
    }
  };
  module.exports = () => compose(filterNonNull, map(tokens.applyTokenizerVisitor(ReplaceWithLineBreakIn)), lookahead);
});

// node_modules/bash-parser/src/modes/posix/rules/for-name-variable.js
var require_for_name_variable = __commonJS((exports, module) => {
  var compose = require_compose_function();
  var map = require_map_iterable();
  var lookahead = require_iterable_lookahead();
  var isValidName = require_is_valid_name();
  module.exports = function forNameVariable() {
    return compose(map((tk, idx, iterable) => {
      let lastToken = iterable.behind(1) || { is: () => false };
      if (lastToken.is("For") && tk.is("WORD") && isValidName(tk.value)) {
        return tk.changeTokenType("NAME", tk.value);
      }
      return tk;
    }), lookahead);
  };
});

// node_modules/bash-parser/src/modes/posix/rules/function-name.js
var require_function_name = __commonJS((exports, module) => {
  var compose = require_compose_function();
  var map = require_map_iterable();
  var lookahead = require_iterable_lookahead();
  module.exports = function functionName() {
    return compose(map((tk, idx, iterable) => {
      if (tk._.maybeStartOfSimpleCommand && tk.is("WORD") && iterable.ahead(2) && iterable.ahead(1).is("OPEN_PAREN") && iterable.ahead(2).is("CLOSE_PAREN")) {
        tk = tk.changeTokenType("NAME", tk.value);
      }
      return tk;
    }), lookahead.depth(2));
  };
});

// node_modules/bash-parser/src/modes/posix/rules/io-number.js
var require_io_number = __commonJS((exports, module) => {
  var compose = require_compose_function();
  var map = require_map_iterable();
  var lookahead = require_iterable_lookahead();
  module.exports = function ioNumber(options, mode) {
    return compose(map((tk, idx, iterable) => {
      const next = iterable.ahead(1);
      if (tk && tk.is("WORD") && tk.value.match(/^[0-9]+$/) && mode.enums.IOFileOperators.isOperator(next)) {
        return tk.changeTokenType("IO_NUMBER", tk.value);
      }
      return tk;
    }), lookahead);
  };
});

// node_modules/bash-parser/src/modes/posix/rules/new-line-list.js
var require_new_line_list = __commonJS((exports, module) => {
  var compose = require_compose_function();
  var map = require_map_iterable();
  var lookahead = require_iterable_lookahead();
  var tokens = require_tokens();
  var filterNonNull = require_non_null();
  var SkipRepeatedNewLines = {
    NEWLINE(tk, iterable) {
      const lastToken = iterable.behind(1) || tokens.mkToken("EMPTY");
      if (lastToken.is("NEWLINE")) {
        return null;
      }
      return tokens.changeTokenType(tk, "NEWLINE_LIST", `
`);
    }
  };
  module.exports = () => compose(filterNonNull, map(tokens.applyTokenizerVisitor(SkipRepeatedNewLines)), lookahead);
});

// node_modules/bash-parser/src/modes/posix/rules/assignment-word.js
var require_assignment_word = __commonJS((exports, module) => {
  var map = require_map_iterable();
  var isValidName = require_is_valid_name();
  module.exports = function assignmentWord() {
    return map((tk, idx, ctx) => {
      if (tk._.maybeStartOfSimpleCommand) {
        ctx.commandPrefixNotAllowed = false;
      }
      if (!ctx.commandPrefixNotAllowed && tk.is("WORD") && tk.value.indexOf("=") > 0 && isValidName(tk.value.slice(0, tk.value.indexOf("=")))) {
        return tk.changeTokenType("ASSIGNMENT_WORD", tk.value);
      }
      ctx.commandPrefixNotAllowed = true;
      return tk;
    });
  };
});

// node_modules/bash-parser/src/modes/posix/rules/syntaxerror-oncontinue.js
var require_syntaxerror_oncontinue = __commonJS((exports, module) => {
  var map = require_map_iterable();
  module.exports = function syntaxerrorOnContinue() {
    return map((tk) => {
      if (tk && tk.is("CONTINUE")) {
        throw new SyntaxError("Unclosed " + tk.value);
      }
      return tk;
    });
  };
});

// node_modules/bash-parser/src/modes/posix/rules/index.js
var require_rules = __commonJS((exports) => {
  exports.parameterExpansion = require_parameter_expansion();
  exports.commandExpansion = require_command_expansion();
  exports.arithmeticExpansion = require_arithmetic_expansion();
  exports.aliasSubstitution = require_alias_substitution2();
  exports.defaultNodeType = require_default_node_type();
  exports.fieldSplitting = require_field_splitting();
  exports.tildeExpanding = require_tilde_expanding();
  exports.pathExpansion = require_path_expansion();
  exports.quoteRemoval = require_quote_removal();
  exports.identifySimpleCommandNames = require_identify_simplecommand_names();
  exports.identifyMaybeSimpleCommands = require_identify_maybe_simple_commands();
  exports.operatorTokens = require_operator_tokens();
  exports.reservedWords = require_reserved_words();
  exports.separator = require_separator();
  exports.linebreakIn = require_linebreak_in();
  exports.forNameVariable = require_for_name_variable();
  exports.functionName = require_function_name();
  exports.ioNumber = require_io_number();
  exports.newLineList = require_new_line_list();
  exports.assignmentWord = require_assignment_word();
  exports.syntaxerrorOnContinue = require_syntaxerror_oncontinue();
});

// node_modules/bash-parser/src/modes/posix/grammar.js
var require_grammar = __commonJS((exports, module) => {
  module.exports = {
    start: "complete_command",
    bnf: {
      complete_command: [
        [
          "list separator EOF",
          " return yy.checkAsync($list, $separator)"
        ],
        [
          "list EOF",
          " return $list "
        ],
        [
          "separator list EOF",
          " return $list "
        ],
        [
          "separator list separator EOF",
          " return yy.checkAsync($list, $separator)"
        ]
      ],
      list: [
        [
          "list separator and_or",
          "$$ = yy.listAppend($list, $and_or, $separator);"
        ],
        [
          "and_or",
          "$$ = yy.list($and_or);"
        ]
      ],
      and_or: [
        [
          "pipeline",
          "$$ = $pipeline;"
        ],
        [
          "and_or AND_IF linebreak pipeline",
          "$$ = yy.andAndOr($and_or, $pipeline);"
        ],
        [
          "and_or OR_IF linebreak pipeline",
          "$$ = yy.orAndOr($and_or, $pipeline);"
        ]
      ],
      pipeline: [
        [
          "pipe_sequence",
          "$$ = yy.pipeLine($pipe_sequence);"
        ],
        [
          "Bang pipe_sequence",
          "$$ = yy.bangPipeLine($pipe_sequence);"
        ]
      ],
      pipe_sequence: [
        [
          "command",
          "$$ = yy.pipeSequence($command);"
        ],
        [
          "pipe_sequence PIPE linebreak command",
          "$$ = yy.pipeSequenceAppend($pipe_sequence, $command);"
        ]
      ],
      command: [
        "simple_command",
        "compound_command",
        [
          "compound_command redirect_list",
          "$$ = yy.addRedirections($compound_command, $redirect_list)"
        ],
        "function_definition"
      ],
      compound_command: [
        "brace_group",
        "subshell",
        "for_clause",
        "case_clause",
        "if_clause",
        "while_clause",
        "until_clause"
      ],
      subshell: [
        [
          "OPEN_PAREN compound_list CLOSE_PAREN",
          "$$ = yy.subshell($compound_list, $OPEN_PAREN.loc, $CLOSE_PAREN.loc);"
        ]
      ],
      compound_list: [
        [
          "term",
          "$$ = $term;"
        ],
        [
          "NEWLINE_LIST term",
          "$$ = $term;"
        ],
        [
          "term separator",
          "$$ = yy.checkAsync($term, $separator);"
        ],
        [
          "NEWLINE_LIST term separator",
          "$$ = yy.checkAsync($term, $separator);"
        ]
      ],
      term: [
        [
          "term separator and_or",
          "$$ = yy.termAppend($term, $and_or, $separator);"
        ],
        [
          "and_or",
          "$$ = yy.term($and_or);"
        ]
      ],
      for_clause: [
        [
          "For name linebreak do_group",
          "$$ = yy.forClauseDefault($name, $do_group, $For.loc);"
        ],
        [
          "For name LINEBREAK_IN separator do_group",
          "$$ = yy.forClauseDefault($name, $do_group, $For.loc);"
        ],
        [
          "For name In separator do_group",
          "$$ = yy.forClauseDefault($name, $do_group, $For.loc);"
        ],
        [
          "For name in wordlist separator do_group",
          "$$ = yy.forClause($name, $wordlist, $do_group, $For.loc);"
        ]
      ],
      name: [
        "NAME"
      ],
      in: [
        "In"
      ],
      wordlist: [
        "wordlist_repetition_plus0"
      ],
      case_clause: [
        [
          "Case WORD linebreak in linebreak case_list Esac",
          "$$ = yy.caseClause($WORD, $case_list, $Case.loc, $Esac.loc);"
        ],
        [
          "Case WORD linebreak in linebreak case_list_ns Esac",
          "$$ = yy.caseClause($WORD, $case_list_ns, $Case.loc, $Esac.loc);"
        ],
        [
          "Case WORD linebreak in linebreak Esac",
          "$$ = yy.caseClause($WORD, null, $Case.loc, $Esac.loc);"
        ]
      ],
      case_list_ns: [
        [
          "case_list case_item_ns",
          "$$ = yy.caseListAppend($case_list, $case_item_ns);"
        ],
        [
          "case_item_ns",
          "$$ = yy.caseList($case_item_ns);"
        ]
      ],
      case_list: [
        [
          "case_list case_item",
          "$$ = yy.caseListAppend($case_list, $case_item);"
        ],
        [
          "case_item",
          "$$ = yy.caseList($case_item);"
        ]
      ],
      case_item_ns: [
        [
          "pattern CLOSE_PAREN linebreak",
          "$$ = yy.caseItem($pattern, null, $pattern[0].loc, $CLOSE_PAREN.loc);"
        ],
        [
          "pattern CLOSE_PAREN compound_list linebreak",
          "$$ = yy.caseItem($pattern, $compound_list, $pattern[0].loc, $compound_list.loc);"
        ],
        [
          "OPEN_PAREN pattern CLOSE_PAREN linebreak",
          "$$ = yy.caseItem($pattern, null, $OPEN_PAREN.loc, $CLOSE_PAREN.loc );"
        ],
        [
          "OPEN_PAREN pattern CLOSE_PAREN compound_list linebreak",
          "$$ = yy.caseItem($pattern, $compound_list, $OPEN_PAREN.loc, $compound_list.loc);"
        ]
      ],
      case_item: [
        [
          "pattern CLOSE_PAREN linebreak DSEMI linebreak",
          "$$ = yy.caseItem($pattern, null, $pattern[0].loc, $DSEMI.loc);"
        ],
        [
          "pattern CLOSE_PAREN compound_list DSEMI linebreak",
          "$$ = yy.caseItem($pattern, $compound_list, $pattern[0].loc, $DSEMI.loc);"
        ],
        [
          "OPEN_PAREN pattern CLOSE_PAREN linebreak DSEMI linebreak",
          "$$ = yy.caseItem($pattern, null, $OPEN_PAREN.loc, $DSEMI.loc );"
        ],
        [
          "OPEN_PAREN pattern CLOSE_PAREN compound_list DSEMI linebreak",
          "$$ = yy.caseItem($pattern, $compound_list, $OPEN_PAREN.loc, $DSEMI.loc);"
        ]
      ],
      pattern: [
        [
          "WORD",
          "$$ = yy.pattern($WORD);"
        ],
        [
          "pattern PIPE WORD",
          "$$ = yy.patternAppend($pattern, $WORD);"
        ]
      ],
      if_clause: [
        [
          "If compound_list Then compound_list else_part Fi",
          "$$ = yy.ifClause($2, $4, $else_part, $If.loc, $Fi.loc);"
        ],
        [
          "If compound_list Then compound_list Fi",
          "$$ = yy.ifClause($2, $4, null, $If.loc, $Fi.loc);"
        ]
      ],
      else_part: [
        [
          "Elif compound_list Then compound_list",
          "$$ = yy.ifClause($2, $4, null, $Elif.loc, $4.loc);"
        ],
        [
          "Elif compound_list Then compound_list else_part",
          "$$ = yy.ifClause($2, $4, $else_part, $Elif.loc, $else_part.loc);"
        ],
        [
          "Else compound_list",
          "$$ = yy.elseClause($compound_list, $Else);"
        ]
      ],
      while_clause: [
        [
          "While compound_list do_group",
          "$$ = yy.while($2, $3, $While);"
        ]
      ],
      until_clause: [
        [
          "Until compound_list do_group",
          "$$ = yy.until($2, $3, $Until);"
        ]
      ],
      function_definition: [
        [
          "fname OPEN_PAREN CLOSE_PAREN linebreak function_body",
          "$$ = yy.functionDefinition($fname, $function_body);"
        ]
      ],
      function_body: [
        [
          "compound_command",
          "$$ = [$compound_command, null];"
        ],
        [
          "compound_command redirect_list",
          "$$ = [$compound_command, $redirect_list];"
        ]
      ],
      fname: [
        "NAME"
      ],
      brace_group: [
        [
          "Lbrace compound_list Rbrace",
          "$$ = yy.braceGroup($compound_list, $Lbrace.loc, $Rbrace.loc);"
        ]
      ],
      do_group: [
        [
          "Do compound_list Done",
          "$$ = yy.doGroup($compound_list, $Do.loc, $Done.loc);"
        ]
      ],
      simple_command: [
        [
          "cmd_prefix cmd_word cmd_suffix",
          "$$ =yy.command($cmd_prefix, $cmd_word, $cmd_suffix);"
        ],
        [
          "cmd_prefix cmd_word",
          "$$ =yy.command($cmd_prefix, $cmd_word, null);"
        ],
        [
          "cmd_prefix",
          "$$ =yy.commandAssignment($cmd_prefix);"
        ],
        [
          "cmd_name cmd_suffix",
          "$$ =yy.command(null, $cmd_name, $cmd_suffix);"
        ],
        [
          "cmd_name",
          "$$ =yy.command(null, $cmd_name);"
        ]
      ],
      cmd_name: [
        [
          "WORD",
          "$$ =yy.commandName(yytext) /* Apply rule 7a */;"
        ]
      ],
      cmd_word: [
        [
          "WORD",
          "$$ = yytext\t/* Apply rule 7B */;"
        ]
      ],
      cmd_prefix: [
        [
          "io_redirect",
          "$$ = yy.prefix($io_redirect);"
        ],
        [
          "cmd_prefix io_redirect",
          "$$ = yy.prefixAppend($1, $2);"
        ],
        [
          "ASSIGNMENT_WORD",
          "$$ = yy.prefix($1);"
        ],
        [
          "cmd_prefix ASSIGNMENT_WORD",
          "$$ = yy.prefixAppend($1, $2);"
        ]
      ],
      cmd_suffix: [
        [
          "io_redirect",
          "$$ = yy.suffix($io_redirect);"
        ],
        [
          "cmd_suffix io_redirect",
          "$$ = yy.suffixAppend($cmd_suffix, $io_redirect);"
        ],
        [
          "WORD",
          "$$ = yy.suffix($1);"
        ],
        [
          "cmd_suffix WORD",
          "$$ = yy.suffixAppend($cmd_suffix, $2);"
        ]
      ],
      redirect_list: [
        [
          "io_redirect",
          "$$ = [$io_redirect];"
        ],
        [
          "redirect_list io_redirect",
          "$$ = $redirect_list.concat($io_redirect);"
        ]
      ],
      io_redirect: [
        [
          "io_file",
          "$$ = $io_file;"
        ],
        [
          "IO_NUMBER io_file",
          "$$ = yy.numberIoRedirect($io_file, $1);"
        ],
        "io_here",
        "IO_NUMBER io_here"
      ],
      io_file: [
        [
          "LESS filename",
          "$$ =yy.ioRedirect($1, $filename);"
        ],
        [
          "LESSAND filename",
          "$$ =yy.ioRedirect($1, $filename);"
        ],
        [
          "GREAT filename",
          "$$ =yy.ioRedirect($1, $filename);"
        ],
        [
          "GREATAND filename",
          "$$ =yy.ioRedirect($1, $filename);"
        ],
        [
          "DGREAT filename",
          "$$ =yy.ioRedirect($1, $filename);"
        ],
        [
          "LESSGREAT filename",
          "$$ =yy.ioRedirect($1, $filename);"
        ],
        [
          "CLOBBER filename",
          "$$ =yy.ioRedirect($1, $filename);"
        ]
      ],
      filename: [
        "WORD"
      ],
      io_here: [
        "DLESS here_end",
        "DLESSDASH here_end"
      ],
      here_end: [
        "WORD"
      ],
      linebreak: [
        "NEWLINE_LIST",
        ""
      ],
      separator: [
        "SEPARATOR_OP",
        "NEWLINE_LIST"
      ],
      wordlist_repetition_plus0: [
        [
          "WORD",
          "$$ = [$1];"
        ],
        [
          "wordlist_repetition_plus0 WORD",
          "$1.push($2);"
        ]
      ]
    }
  };
});

// node_modules/bash-parser/src/modes/posix/enums/io-file-operators.js
var require_io_file_operators = __commonJS((exports, module) => {
  var ioFileOperators = module.exports = [
    "LESS",
    "DLESS",
    "DGREAT",
    "LESSAND",
    "GREATAND",
    "GREAT",
    "LESSGREAT",
    "CLOBBER"
  ];
  ioFileOperators.isOperator = function isOperator(tk) {
    for (const op of ioFileOperators) {
      if (tk.type === op) {
        return true;
      }
    }
    return false;
  };
});

// node_modules/bash-parser/src/modes/posix/enums/parameter-operators.js
var require_parameter_operators = __commonJS((exports, module) => {
  var name = "[a-zA-Z_][a-zA-Z0-9_]*";
  var parameterOps = {
    [`^(${name}):\\-(.*)$`]: {
      op: "useDefaultValue",
      parameter: (m) => m[1],
      word: (m) => m[2],
      expand: ["word"]
    },
    [`^(${name}):\\=(.*)$`]: {
      op: "assignDefaultValue",
      parameter: (m) => m[1],
      word: (m) => m[2],
      expand: ["word"]
    },
    [`^(${name}):\\?(.*)$`]: {
      op: "indicateErrorIfNull",
      parameter: (m) => m[1],
      word: (m) => m[2],
      expand: ["word"]
    },
    [`^(${name}):\\+(.*)$`]: {
      op: "useAlternativeValue",
      parameter: (m) => m[1],
      word: (m) => m[2],
      expand: ["word"]
    },
    [`^(${name})\\-(.*)$`]: {
      op: "useDefaultValueIfUnset",
      parameter: (m) => m[1],
      word: (m) => m[2],
      expand: ["word"]
    },
    [`^(${name})\\=(.*)$`]: {
      op: "assignDefaultValueIfUnset",
      parameter: (m) => m[1],
      word: (m) => m[2],
      expand: ["word"]
    },
    [`^(${name})\\?(.*)$`]: {
      op: "indicateErrorIfUnset",
      parameter: (m) => m[1],
      word: (m) => m[2],
      expand: ["word"]
    },
    [`^(${name})\\+(.*)$`]: {
      op: "useAlternativeValueIfUnset",
      parameter: (m) => m[1],
      word: (m) => m[2],
      expand: ["word"]
    },
    [`^(${name})\\%\\%(.*)$`]: {
      op: "removeLargestSuffixPattern",
      parameter: (m) => m[1],
      word: (m) => m[2],
      expand: ["word"]
    },
    [`^(${name})\\#\\#(.*)$`]: {
      op: "removeLargestPrefixPattern",
      parameter: (m) => m[1],
      word: (m) => m[2],
      expand: ["word"]
    },
    [`^(${name})\\%(.*)$`]: {
      op: "removeSmallestSuffixPattern",
      parameter: (m) => m[1],
      word: (m) => m[2],
      expand: ["word"]
    },
    [`^(${name})\\#(.*)$`]: {
      op: "removeSmallestPrefixPattern",
      parameter: (m) => m[1],
      word: (m) => m[2],
      expand: ["word"]
    },
    [`^\\#(${name})$`]: {
      op: "stringLength",
      parameter: (m) => m[1]
    },
    [`^([1-9][0-9]*)$`]: {
      kind: "positional",
      parameter: (m) => Number(m[1])
    },
    "^!$": {
      kind: "last-background-pid"
    },
    "^\\@$": {
      kind: "positional-list"
    },
    "^\\-$": {
      kind: "current-option-flags"
    },
    "^\\#$": {
      kind: "positional-count"
    },
    "^\\?$": {
      kind: "last-exit-status"
    },
    "^\\*$": {
      kind: "positional-string"
    },
    "^\\$$": {
      kind: "shell-process-id"
    },
    "^0$": {
      kind: "shell-script-name"
    }
  };
  module.exports = parameterOps;
});

// node_modules/bash-parser/src/modes/posix/enums/reserved-words.js
var require_reserved_words2 = __commonJS((exports, module) => {
  module.exports = {
    if: "If",
    then: "Then",
    else: "Else",
    elif: "Elif",
    fi: "Fi",
    do: "Do",
    done: "Done",
    case: "Case",
    esac: "Esac",
    while: "While",
    until: "Until",
    for: "For",
    in: "In",
    "{": "Lbrace",
    "}": "Rbrace",
    "!": "Bang"
  };
});

// node_modules/bash-parser/src/modes/posix/enums/index.js
var require_enums = __commonJS((exports) => {
  exports.IOFileOperators = require_io_file_operators();
  exports.operators = require_operators();
  exports.parameterOperators = require_parameter_operators();
  exports.reservedWords = require_reserved_words2();
});

// node_modules/bash-parser/src/modes/posix/built-grammar.js
var require_built_grammar = __commonJS((exports, module) => {
  var parser = function() {
    var o = function(k, v, o2, l) {
      for (o2 = o2 || {}, l = k.length;l--; o2[k[l]] = v)
        ;
      return o2;
    }, $V0 = [1, 9], $V1 = [1, 28], $V2 = [1, 6], $V3 = [1, 29], $V4 = [1, 34], $V5 = [1, 30], $V6 = [1, 26], $V7 = [1, 31], $V8 = [1, 32], $V9 = [1, 33], $Va = [1, 27], $Vb = [1, 25], $Vc = [1, 36], $Vd = [1, 38], $Ve = [1, 39], $Vf = [1, 40], $Vg = [1, 41], $Vh = [1, 42], $Vi = [1, 43], $Vj = [1, 44], $Vk = [1, 45], $Vl = [1, 46], $Vm = [1, 5], $Vn = [6, 31, 84], $Vo = [1, 50], $Vp = [1, 51], $Vq = [6, 13, 27, 29, 31, 32, 39, 41, 42, 44, 49, 50, 51, 53, 54, 55, 56, 57, 60, 61, 62, 63, 69, 71, 73, 75, 76, 77, 78, 79, 80, 81, 83], $Vr = [6, 9, 11, 29, 31, 44, 49, 51, 53, 54, 55, 61, 62, 63, 84], $Vs = [1, 52], $Vt = [6, 9, 11, 15, 29, 31, 44, 49, 51, 53, 54, 55, 61, 62, 63, 84], $Vu = [1, 62], $Vv = [6, 9, 11, 15, 29, 31, 44, 49, 51, 53, 54, 55, 61, 62, 63, 71, 73, 75, 76, 77, 78, 79, 80, 81, 83, 84], $Vw = [6, 9, 11, 15, 29, 31, 42, 44, 49, 51, 53, 54, 55, 61, 62, 63, 69, 71, 73, 75, 76, 77, 78, 79, 80, 81, 83, 84], $Vx = [6, 9, 11, 15, 29, 31, 42, 44, 49, 51, 53, 54, 55, 61, 62, 63, 71, 73, 75, 76, 77, 78, 79, 80, 81, 83, 84], $Vy = [1, 66], $Vz = [1, 78], $VA = [1, 86], $VB = [13, 27, 32, 39, 41, 42, 50, 56, 57, 60, 69, 71, 73, 75, 76, 77, 78, 79, 80, 81, 83], $VC = [2, 102], $VD = [1, 93], $VE = [1, 99], $VF = [29, 44, 49, 51, 53, 54, 55, 61, 62, 63], $VG = [29, 31, 44, 49, 51, 53, 54, 55, 61, 62, 63, 84], $VH = [1, 112], $VI = [2, 101], $VJ = [29, 31, 44, 49, 51, 53, 54, 55, 61, 62, 63], $VK = [2, 37], $VL = [31, 42, 84], $VM = [27, 42, 44], $VN = [1, 140], $VO = [1, 141], $VP = [1, 151], $VQ = [1, 152], $VR = [1, 161], $VS = [15, 29], $VT = [44, 49], $VU = [1, 166];
    var parser2 = {
      trace: function trace() {},
      yy: {},
      symbols_: { error: 2, complete_command: 3, list: 4, separator: 5, EOF: 6, and_or: 7, pipeline: 8, AND_IF: 9, linebreak: 10, OR_IF: 11, pipe_sequence: 12, Bang: 13, command: 14, PIPE: 15, simple_command: 16, compound_command: 17, redirect_list: 18, function_definition: 19, brace_group: 20, subshell: 21, for_clause: 22, case_clause: 23, if_clause: 24, while_clause: 25, until_clause: 26, OPEN_PAREN: 27, compound_list: 28, CLOSE_PAREN: 29, term: 30, NEWLINE_LIST: 31, For: 32, name: 33, do_group: 34, LINEBREAK_IN: 35, In: 36, in: 37, wordlist: 38, NAME: 39, wordlist_repetition_plus0: 40, Case: 41, WORD: 42, case_list: 43, Esac: 44, case_list_ns: 45, case_item_ns: 46, case_item: 47, pattern: 48, DSEMI: 49, If: 50, Then: 51, else_part: 52, Fi: 53, Elif: 54, Else: 55, While: 56, Until: 57, fname: 58, function_body: 59, Lbrace: 60, Rbrace: 61, Do: 62, Done: 63, cmd_prefix: 64, cmd_word: 65, cmd_suffix: 66, cmd_name: 67, io_redirect: 68, ASSIGNMENT_WORD: 69, io_file: 70, IO_NUMBER: 71, io_here: 72, LESS: 73, filename: 74, LESSAND: 75, GREAT: 76, GREATAND: 77, DGREAT: 78, LESSGREAT: 79, CLOBBER: 80, DLESS: 81, here_end: 82, DLESSDASH: 83, SEPARATOR_OP: 84, $accept: 0, $end: 1 },
      terminals_: { 2: "error", 6: "EOF", 9: "AND_IF", 11: "OR_IF", 13: "Bang", 15: "PIPE", 27: "OPEN_PAREN", 29: "CLOSE_PAREN", 31: "NEWLINE_LIST", 32: "For", 35: "LINEBREAK_IN", 36: "In", 39: "NAME", 41: "Case", 42: "WORD", 44: "Esac", 49: "DSEMI", 50: "If", 51: "Then", 53: "Fi", 54: "Elif", 55: "Else", 56: "While", 57: "Until", 60: "Lbrace", 61: "Rbrace", 62: "Do", 63: "Done", 69: "ASSIGNMENT_WORD", 71: "IO_NUMBER", 73: "LESS", 75: "LESSAND", 76: "GREAT", 77: "GREATAND", 78: "DGREAT", 79: "LESSGREAT", 80: "CLOBBER", 81: "DLESS", 83: "DLESSDASH", 84: "SEPARATOR_OP" },
      productions_: [0, [3, 3], [3, 2], [3, 3], [3, 4], [4, 3], [4, 1], [7, 1], [7, 4], [7, 4], [8, 1], [8, 2], [12, 1], [12, 4], [14, 1], [14, 1], [14, 2], [14, 1], [17, 1], [17, 1], [17, 1], [17, 1], [17, 1], [17, 1], [17, 1], [21, 3], [28, 1], [28, 2], [28, 2], [28, 3], [30, 3], [30, 1], [22, 4], [22, 5], [22, 5], [22, 6], [33, 1], [37, 1], [38, 1], [23, 7], [23, 7], [23, 6], [45, 2], [45, 1], [43, 2], [43, 1], [46, 3], [46, 4], [46, 4], [46, 5], [47, 5], [47, 5], [47, 6], [47, 6], [48, 1], [48, 3], [24, 6], [24, 5], [52, 4], [52, 5], [52, 2], [25, 3], [26, 3], [19, 5], [59, 1], [59, 2], [58, 1], [20, 3], [34, 3], [16, 3], [16, 2], [16, 1], [16, 2], [16, 1], [67, 1], [65, 1], [64, 1], [64, 2], [64, 1], [64, 2], [66, 1], [66, 2], [66, 1], [66, 2], [18, 1], [18, 2], [68, 1], [68, 2], [68, 1], [68, 2], [70, 2], [70, 2], [70, 2], [70, 2], [70, 2], [70, 2], [70, 2], [74, 1], [72, 2], [72, 2], [82, 1], [10, 1], [10, 0], [5, 1], [5, 1], [40, 1], [40, 2]],
      performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {
        var $0 = $$.length - 1;
        switch (yystate) {
          case 1:
            return yy.checkAsync($$[$0 - 2], $$[$0 - 1]);
            break;
          case 2:
          case 3:
            return $$[$0 - 1];
            break;
          case 4:
            return yy.checkAsync($$[$0 - 2], $$[$0 - 3]);
            break;
          case 5:
            this.$ = yy.listAppend($$[$0 - 2], $$[$0], $$[$0 - 1]);
            break;
          case 6:
            this.$ = yy.list($$[$0]);
            break;
          case 7:
          case 26:
          case 27:
          case 86:
            this.$ = $$[$0];
            break;
          case 8:
            this.$ = yy.andAndOr($$[$0 - 3], $$[$0]);
            break;
          case 9:
            this.$ = yy.orAndOr($$[$0 - 3], $$[$0]);
            break;
          case 10:
            this.$ = yy.pipeLine($$[$0]);
            break;
          case 11:
            this.$ = yy.bangPipeLine($$[$0]);
            break;
          case 12:
            this.$ = yy.pipeSequence($$[$0]);
            break;
          case 13:
            this.$ = yy.pipeSequenceAppend($$[$0 - 3], $$[$0]);
            break;
          case 16:
            this.$ = yy.addRedirections($$[$0 - 1], $$[$0]);
            break;
          case 25:
            this.$ = yy.subshell($$[$0 - 1], $$[$0 - 2].loc, $$[$0].loc);
            break;
          case 28:
          case 29:
            this.$ = yy.checkAsync($$[$0 - 1], $$[$0]);
            break;
          case 30:
            this.$ = yy.termAppend($$[$0 - 2], $$[$0], $$[$0 - 1]);
            break;
          case 31:
            this.$ = yy.term($$[$0]);
            break;
          case 32:
            this.$ = yy.forClauseDefault($$[$0 - 2], $$[$0], $$[$0 - 3].loc);
            break;
          case 33:
          case 34:
            this.$ = yy.forClauseDefault($$[$0 - 3], $$[$0], $$[$0 - 4].loc);
            break;
          case 35:
            this.$ = yy.forClause($$[$0 - 4], $$[$0 - 2], $$[$0], $$[$0 - 5].loc);
            break;
          case 39:
          case 40:
            this.$ = yy.caseClause($$[$0 - 5], $$[$0 - 1], $$[$0 - 6].loc, $$[$0].loc);
            break;
          case 41:
            this.$ = yy.caseClause($$[$0 - 4], null, $$[$0 - 5].loc, $$[$0].loc);
            break;
          case 42:
          case 44:
            this.$ = yy.caseListAppend($$[$0 - 1], $$[$0]);
            break;
          case 43:
          case 45:
            this.$ = yy.caseList($$[$0]);
            break;
          case 46:
            this.$ = yy.caseItem($$[$0 - 2], null, $$[$0 - 2][0].loc, $$[$0 - 1].loc);
            break;
          case 47:
            this.$ = yy.caseItem($$[$0 - 3], $$[$0 - 1], $$[$0 - 3][0].loc, $$[$0 - 1].loc);
            break;
          case 48:
            this.$ = yy.caseItem($$[$0 - 2], null, $$[$0 - 3].loc, $$[$0 - 1].loc);
            break;
          case 49:
            this.$ = yy.caseItem($$[$0 - 3], $$[$0 - 1], $$[$0 - 4].loc, $$[$0 - 1].loc);
            break;
          case 50:
            this.$ = yy.caseItem($$[$0 - 4], null, $$[$0 - 4][0].loc, $$[$0 - 1].loc);
            break;
          case 51:
            this.$ = yy.caseItem($$[$0 - 4], $$[$0 - 2], $$[$0 - 4][0].loc, $$[$0 - 1].loc);
            break;
          case 52:
            this.$ = yy.caseItem($$[$0 - 4], null, $$[$0 - 5].loc, $$[$0 - 1].loc);
            break;
          case 53:
            this.$ = yy.caseItem($$[$0 - 4], $$[$0 - 2], $$[$0 - 5].loc, $$[$0 - 1].loc);
            break;
          case 54:
            this.$ = yy.pattern($$[$0]);
            break;
          case 55:
            this.$ = yy.patternAppend($$[$0 - 2], $$[$0]);
            break;
          case 56:
            this.$ = yy.ifClause($$[$0 - 4], $$[$0 - 2], $$[$0 - 1], $$[$0 - 5].loc, $$[$0].loc);
            break;
          case 57:
            this.$ = yy.ifClause($$[$0 - 3], $$[$0 - 1], null, $$[$0 - 4].loc, $$[$0].loc);
            break;
          case 58:
            this.$ = yy.ifClause($$[$0 - 2], $$[$0], null, $$[$0 - 3].loc, $$[$0].loc);
            break;
          case 59:
            this.$ = yy.ifClause($$[$0 - 3], $$[$0 - 1], $$[$0], $$[$0 - 4].loc, $$[$0].loc);
            break;
          case 60:
            this.$ = yy.elseClause($$[$0], $$[$0 - 1]);
            break;
          case 61:
            this.$ = yy.while($$[$0 - 1], $$[$0], $$[$0 - 2]);
            break;
          case 62:
            this.$ = yy.until($$[$0 - 1], $$[$0], $$[$0 - 2]);
            break;
          case 63:
            this.$ = yy.functionDefinition($$[$0 - 4], $$[$0]);
            break;
          case 64:
            this.$ = [$$[$0], null];
            break;
          case 65:
            this.$ = [$$[$0 - 1], $$[$0]];
            break;
          case 67:
            this.$ = yy.braceGroup($$[$0 - 1], $$[$0 - 2].loc, $$[$0].loc);
            break;
          case 68:
            this.$ = yy.doGroup($$[$0 - 1], $$[$0 - 2].loc, $$[$0].loc);
            break;
          case 69:
            this.$ = yy.command($$[$0 - 2], $$[$0 - 1], $$[$0]);
            break;
          case 70:
            this.$ = yy.command($$[$0 - 1], $$[$0], null);
            break;
          case 71:
            this.$ = yy.commandAssignment($$[$0]);
            break;
          case 72:
            this.$ = yy.command(null, $$[$0 - 1], $$[$0]);
            break;
          case 73:
            this.$ = yy.command(null, $$[$0]);
            break;
          case 74:
            this.$ = yy.commandName(yytext);
            break;
          case 75:
            this.$ = yytext;
            break;
          case 76:
          case 78:
            this.$ = yy.prefix($$[$0]);
            break;
          case 77:
          case 79:
            this.$ = yy.prefixAppend($$[$0 - 1], $$[$0]);
            break;
          case 80:
          case 82:
            this.$ = yy.suffix($$[$0]);
            break;
          case 81:
          case 83:
            this.$ = yy.suffixAppend($$[$0 - 1], $$[$0]);
            break;
          case 84:
          case 105:
            this.$ = [$$[$0]];
            break;
          case 85:
            this.$ = $$[$0 - 1].concat($$[$0]);
            break;
          case 87:
            this.$ = yy.numberIoRedirect($$[$0], $$[$0 - 1]);
            break;
          case 90:
          case 91:
          case 92:
          case 93:
          case 94:
          case 95:
          case 96:
            this.$ = yy.ioRedirect($$[$0 - 1], $$[$0]);
            break;
          case 106:
            $$[$0 - 1].push($$[$0]);
            break;
        }
      },
      table: [{ 3: 1, 4: 2, 5: 3, 7: 4, 8: 7, 12: 8, 13: $V0, 14: 10, 16: 11, 17: 12, 19: 13, 20: 16, 21: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 27: $V1, 31: $V2, 32: $V3, 39: $V4, 41: $V5, 42: $V6, 50: $V7, 56: $V8, 57: $V9, 58: 23, 60: $Va, 64: 14, 67: 15, 68: 24, 69: $Vb, 70: 35, 71: $Vc, 72: 37, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl, 84: $Vm }, { 1: [3] }, { 5: 47, 6: [1, 48], 31: $V2, 84: $Vm }, { 4: 49, 7: 4, 8: 7, 12: 8, 13: $V0, 14: 10, 16: 11, 17: 12, 19: 13, 20: 16, 21: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 27: $V1, 32: $V3, 39: $V4, 41: $V5, 42: $V6, 50: $V7, 56: $V8, 57: $V9, 58: 23, 60: $Va, 64: 14, 67: 15, 68: 24, 69: $Vb, 70: 35, 71: $Vc, 72: 37, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }, o($Vn, [2, 6], { 9: $Vo, 11: $Vp }), o($Vq, [2, 103]), o($Vq, [2, 104]), o($Vr, [2, 7]), o($Vr, [2, 10], { 15: $Vs }), { 12: 53, 14: 10, 16: 11, 17: 12, 19: 13, 20: 16, 21: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 27: $V1, 32: $V3, 39: $V4, 41: $V5, 42: $V6, 50: $V7, 56: $V8, 57: $V9, 58: 23, 60: $Va, 64: 14, 67: 15, 68: 24, 69: $Vb, 70: 35, 71: $Vc, 72: 37, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }, o($Vt, [2, 12]), o($Vt, [2, 14]), o($Vt, [2, 15], { 70: 35, 72: 37, 18: 54, 68: 55, 71: $Vc, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }), o($Vt, [2, 17]), o($Vt, [2, 71], { 70: 35, 72: 37, 65: 56, 68: 57, 42: [1, 59], 69: [1, 58], 71: $Vc, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }), o($Vt, [2, 73], { 70: 35, 72: 37, 66: 60, 68: 61, 42: $Vu, 71: $Vc, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }), o($Vv, [2, 18]), o($Vv, [2, 19]), o($Vv, [2, 20]), o($Vv, [2, 21]), o($Vv, [2, 22]), o($Vv, [2, 23]), o($Vv, [2, 24]), { 27: [1, 63] }, o($Vw, [2, 76]), o($Vw, [2, 78]), o($Vx, [2, 74]), { 7: 67, 8: 7, 12: 8, 13: $V0, 14: 10, 16: 11, 17: 12, 19: 13, 20: 16, 21: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 27: $V1, 28: 64, 30: 65, 31: $Vy, 32: $V3, 39: $V4, 41: $V5, 42: $V6, 50: $V7, 56: $V8, 57: $V9, 58: 23, 60: $Va, 64: 14, 67: 15, 68: 24, 69: $Vb, 70: 35, 71: $Vc, 72: 37, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }, { 7: 67, 8: 7, 12: 8, 13: $V0, 14: 10, 16: 11, 17: 12, 19: 13, 20: 16, 21: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 27: $V1, 28: 68, 30: 65, 31: $Vy, 32: $V3, 39: $V4, 41: $V5, 42: $V6, 50: $V7, 56: $V8, 57: $V9, 58: 23, 60: $Va, 64: 14, 67: 15, 68: 24, 69: $Vb, 70: 35, 71: $Vc, 72: 37, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }, { 33: 69, 39: [1, 70] }, { 42: [1, 71] }, { 7: 67, 8: 7, 12: 8, 13: $V0, 14: 10, 16: 11, 17: 12, 19: 13, 20: 16, 21: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 27: $V1, 28: 72, 30: 65, 31: $Vy, 32: $V3, 39: $V4, 41: $V5, 42: $V6, 50: $V7, 56: $V8, 57: $V9, 58: 23, 60: $Va, 64: 14, 67: 15, 68: 24, 69: $Vb, 70: 35, 71: $Vc, 72: 37, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }, { 7: 67, 8: 7, 12: 8, 13: $V0, 14: 10, 16: 11, 17: 12, 19: 13, 20: 16, 21: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 27: $V1, 28: 73, 30: 65, 31: $Vy, 32: $V3, 39: $V4, 41: $V5, 42: $V6, 50: $V7, 56: $V8, 57: $V9, 58: 23, 60: $Va, 64: 14, 67: 15, 68: 24, 69: $Vb, 70: 35, 71: $Vc, 72: 37, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }, { 7: 67, 8: 7, 12: 8, 13: $V0, 14: 10, 16: 11, 17: 12, 19: 13, 20: 16, 21: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 27: $V1, 28: 74, 30: 65, 31: $Vy, 32: $V3, 39: $V4, 41: $V5, 42: $V6, 50: $V7, 56: $V8, 57: $V9, 58: 23, 60: $Va, 64: 14, 67: 15, 68: 24, 69: $Vb, 70: 35, 71: $Vc, 72: 37, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }, { 27: [2, 66] }, o($Vw, [2, 86]), { 70: 75, 72: 76, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }, o($Vw, [2, 88]), { 42: $Vz, 74: 77 }, { 42: $Vz, 74: 79 }, { 42: $Vz, 74: 80 }, { 42: $Vz, 74: 81 }, { 42: $Vz, 74: 82 }, { 42: $Vz, 74: 83 }, { 42: $Vz, 74: 84 }, { 42: $VA, 82: 85 }, { 42: $VA, 82: 87 }, { 6: [1, 88], 7: 89, 8: 7, 12: 8, 13: $V0, 14: 10, 16: 11, 17: 12, 19: 13, 20: 16, 21: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 27: $V1, 32: $V3, 39: $V4, 41: $V5, 42: $V6, 50: $V7, 56: $V8, 57: $V9, 58: 23, 60: $Va, 64: 14, 67: 15, 68: 24, 69: $Vb, 70: 35, 71: $Vc, 72: 37, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }, { 1: [2, 2] }, { 5: 91, 6: [1, 90], 31: $V2, 84: $Vm }, o($VB, $VC, { 10: 92, 31: $VD }), o($VB, $VC, { 10: 94, 31: $VD }), o([27, 32, 39, 41, 42, 50, 56, 57, 60, 69, 71, 73, 75, 76, 77, 78, 79, 80, 81, 83], $VC, { 10: 95, 31: $VD }), o($Vr, [2, 11], { 15: $Vs }), o($Vt, [2, 16], { 70: 35, 72: 37, 68: 96, 71: $Vc, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }), o($Vv, [2, 84]), o($Vt, [2, 70], { 70: 35, 72: 37, 68: 61, 66: 97, 42: $Vu, 71: $Vc, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }), o($Vw, [2, 77]), o($Vw, [2, 79]), o($Vx, [2, 75]), o($Vt, [2, 72], { 70: 35, 72: 37, 68: 98, 42: $VE, 71: $Vc, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }), o($Vx, [2, 80]), o($Vx, [2, 82]), { 29: [1, 100] }, { 61: [1, 101] }, o($VF, [2, 26], { 5: 102, 31: $V2, 84: $Vm }), { 7: 67, 8: 7, 12: 8, 13: $V0, 14: 10, 16: 11, 17: 12, 19: 13, 20: 16, 21: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 27: $V1, 30: 103, 32: $V3, 39: $V4, 41: $V5, 42: $V6, 50: $V7, 56: $V8, 57: $V9, 58: 23, 60: $Va, 64: 14, 67: 15, 68: 24, 69: $Vb, 70: 35, 71: $Vc, 72: 37, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }, o($VG, [2, 31], { 9: $Vo, 11: $Vp }), { 29: [1, 104] }, { 10: 105, 31: $VD, 35: [1, 106], 36: [1, 107], 37: 108, 62: $VC }, o([31, 35, 36, 62], [2, 36]), { 10: 109, 31: $VD, 36: $VC }, { 51: [1, 110] }, { 34: 111, 62: $VH }, { 34: 113, 62: $VH }, o($Vw, [2, 87]), o($Vw, [2, 89]), o($Vw, [2, 90]), o($Vw, [2, 97]), o($Vw, [2, 91]), o($Vw, [2, 92]), o($Vw, [2, 93]), o($Vw, [2, 94]), o($Vw, [2, 95]), o($Vw, [2, 96]), o($Vw, [2, 98]), o($Vw, [2, 100]), o($Vw, [2, 99]), { 1: [2, 1] }, o($Vn, [2, 5], { 9: $Vo, 11: $Vp }), { 1: [2, 3] }, { 6: [1, 114], 7: 89, 8: 7, 12: 8, 13: $V0, 14: 10, 16: 11, 17: 12, 19: 13, 20: 16, 21: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 27: $V1, 32: $V3, 39: $V4, 41: $V5, 42: $V6, 50: $V7, 56: $V8, 57: $V9, 58: 23, 60: $Va, 64: 14, 67: 15, 68: 24, 69: $Vb, 70: 35, 71: $Vc, 72: 37, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }, { 8: 115, 12: 8, 13: $V0, 14: 10, 16: 11, 17: 12, 19: 13, 20: 16, 21: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 27: $V1, 32: $V3, 39: $V4, 41: $V5, 42: $V6, 50: $V7, 56: $V8, 57: $V9, 58: 23, 60: $Va, 64: 14, 67: 15, 68: 24, 69: $Vb, 70: 35, 71: $Vc, 72: 37, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }, o([13, 27, 32, 36, 39, 41, 42, 44, 50, 56, 57, 60, 62, 69, 71, 73, 75, 76, 77, 78, 79, 80, 81, 83], $VI), { 8: 116, 12: 8, 13: $V0, 14: 10, 16: 11, 17: 12, 19: 13, 20: 16, 21: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 27: $V1, 32: $V3, 39: $V4, 41: $V5, 42: $V6, 50: $V7, 56: $V8, 57: $V9, 58: 23, 60: $Va, 64: 14, 67: 15, 68: 24, 69: $Vb, 70: 35, 71: $Vc, 72: 37, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }, { 14: 117, 16: 11, 17: 12, 19: 13, 20: 16, 21: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 27: $V1, 32: $V3, 39: $V4, 41: $V5, 42: $V6, 50: $V7, 56: $V8, 57: $V9, 58: 23, 60: $Va, 64: 14, 67: 15, 68: 24, 69: $Vb, 70: 35, 71: $Vc, 72: 37, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }, o($Vv, [2, 85]), o($Vt, [2, 69], { 70: 35, 72: 37, 68: 98, 42: $VE, 71: $Vc, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }), o($Vx, [2, 81]), o($Vx, [2, 83]), o([27, 32, 41, 50, 56, 57, 60], $VC, { 10: 118, 31: $VD }), o($Vv, [2, 67]), o($VJ, [2, 28], { 8: 7, 12: 8, 14: 10, 16: 11, 17: 12, 19: 13, 64: 14, 67: 15, 20: 16, 21: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 58: 23, 68: 24, 70: 35, 72: 37, 7: 119, 13: $V0, 27: $V1, 32: $V3, 39: $V4, 41: $V5, 42: $V6, 50: $V7, 56: $V8, 57: $V9, 60: $Va, 69: $Vb, 71: $Vc, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }), o($VF, [2, 27], { 5: 120, 31: $V2, 84: $Vm }), o($Vv, [2, 25]), { 34: 121, 62: $VH }, { 5: 122, 31: $V2, 84: $Vm }, { 5: 123, 31: $V2, 42: $VK, 84: $Vm }, { 38: 124, 40: 125, 42: [1, 126] }, { 36: [1, 128], 37: 127 }, { 7: 67, 8: 7, 12: 8, 13: $V0, 14: 10, 16: 11, 17: 12, 19: 13, 20: 16, 21: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 27: $V1, 28: 129, 30: 65, 31: $Vy, 32: $V3, 39: $V4, 41: $V5, 42: $V6, 50: $V7, 56: $V8, 57: $V9, 58: 23, 60: $Va, 64: 14, 67: 15, 68: 24, 69: $Vb, 70: 35, 71: $Vc, 72: 37, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }, o($Vv, [2, 61]), { 7: 67, 8: 7, 12: 8, 13: $V0, 14: 10, 16: 11, 17: 12, 19: 13, 20: 16, 21: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 27: $V1, 28: 130, 30: 65, 31: $Vy, 32: $V3, 39: $V4, 41: $V5, 42: $V6, 50: $V7, 56: $V8, 57: $V9, 58: 23, 60: $Va, 64: 14, 67: 15, 68: 24, 69: $Vb, 70: 35, 71: $Vc, 72: 37, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }, o($Vv, [2, 62]), { 1: [2, 4] }, o($Vr, [2, 8]), o($Vr, [2, 9]), o($Vt, [2, 13]), { 17: 132, 20: 16, 21: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 27: $V1, 32: $V3, 41: $V5, 50: $V7, 56: $V8, 57: $V9, 59: 131, 60: $Va }, o($VG, [2, 30], { 9: $Vo, 11: $Vp }), o($VJ, [2, 29], { 8: 7, 12: 8, 14: 10, 16: 11, 17: 12, 19: 13, 64: 14, 67: 15, 20: 16, 21: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 58: 23, 68: 24, 70: 35, 72: 37, 7: 119, 13: $V0, 27: $V1, 32: $V3, 39: $V4, 41: $V5, 42: $V6, 50: $V7, 56: $V8, 57: $V9, 60: $Va, 69: $Vb, 71: $Vc, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }), o($Vv, [2, 32]), { 34: 133, 62: $VH }, { 34: 134, 62: $VH }, { 5: 135, 31: $V2, 84: $Vm }, o([31, 84], [2, 38], { 42: [1, 136] }), o($VL, [2, 105]), o($VM, $VC, { 10: 137, 31: $VD }), o([27, 31, 42, 44], $VK), { 52: 138, 53: [1, 139], 54: $VN, 55: $VO }, { 63: [1, 142] }, o($Vt, [2, 63]), o($Vt, [2, 64], { 70: 35, 72: 37, 68: 55, 18: 143, 71: $Vc, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }), o($Vv, [2, 33]), o($Vv, [2, 34]), { 34: 144, 62: $VH }, o($VL, [2, 106]), { 27: $VP, 42: $VQ, 43: 145, 44: [1, 147], 45: 146, 46: 149, 47: 148, 48: 150 }, { 53: [1, 153] }, o($Vv, [2, 57]), { 7: 67, 8: 7, 12: 8, 13: $V0, 14: 10, 16: 11, 17: 12, 19: 13, 20: 16, 21: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 27: $V1, 28: 154, 30: 65, 31: $Vy, 32: $V3, 39: $V4, 41: $V5, 42: $V6, 50: $V7, 56: $V8, 57: $V9, 58: 23, 60: $Va, 64: 14, 67: 15, 68: 24, 69: $Vb, 70: 35, 71: $Vc, 72: 37, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }, { 7: 67, 8: 7, 12: 8, 13: $V0, 14: 10, 16: 11, 17: 12, 19: 13, 20: 16, 21: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 27: $V1, 28: 155, 30: 65, 31: $Vy, 32: $V3, 39: $V4, 41: $V5, 42: $V6, 50: $V7, 56: $V8, 57: $V9, 58: 23, 60: $Va, 64: 14, 67: 15, 68: 24, 69: $Vb, 70: 35, 71: $Vc, 72: 37, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }, o($Vv, [2, 68]), o($Vt, [2, 65], { 70: 35, 72: 37, 68: 96, 71: $Vc, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }), o($Vv, [2, 35]), { 27: $VP, 42: $VQ, 44: [1, 156], 46: 158, 47: 157, 48: 150 }, { 44: [1, 159] }, o($Vv, [2, 41]), o($VM, [2, 45]), { 44: [2, 43] }, { 15: $VR, 29: [1, 160] }, { 42: $VQ, 48: 162 }, o($VS, [2, 54]), o($Vv, [2, 56]), { 51: [1, 163] }, { 53: [2, 60] }, o($Vv, [2, 39]), o($VM, [2, 44]), { 44: [2, 42] }, o($Vv, [2, 40]), o($VT, $VC, { 8: 7, 12: 8, 14: 10, 16: 11, 17: 12, 19: 13, 64: 14, 67: 15, 20: 16, 21: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 58: 23, 68: 24, 70: 35, 72: 37, 30: 65, 7: 67, 10: 164, 28: 165, 13: $V0, 27: $V1, 31: $VU, 32: $V3, 39: $V4, 41: $V5, 42: $V6, 50: $V7, 56: $V8, 57: $V9, 60: $Va, 69: $Vb, 71: $Vc, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }), { 42: [1, 167] }, { 15: $VR, 29: [1, 168] }, { 7: 67, 8: 7, 12: 8, 13: $V0, 14: 10, 16: 11, 17: 12, 19: 13, 20: 16, 21: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 27: $V1, 28: 169, 30: 65, 31: $Vy, 32: $V3, 39: $V4, 41: $V5, 42: $V6, 50: $V7, 56: $V8, 57: $V9, 58: 23, 60: $Va, 64: 14, 67: 15, 68: 24, 69: $Vb, 70: 35, 71: $Vc, 72: 37, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }, { 44: [2, 46], 49: [1, 170] }, { 10: 172, 31: $VD, 44: $VC, 49: [1, 171] }, o($VT, $VI, { 8: 7, 12: 8, 14: 10, 16: 11, 17: 12, 19: 13, 64: 14, 67: 15, 20: 16, 21: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 58: 23, 68: 24, 70: 35, 72: 37, 7: 67, 30: 103, 13: $V0, 27: $V1, 32: $V3, 39: $V4, 41: $V5, 42: $V6, 50: $V7, 56: $V8, 57: $V9, 60: $Va, 69: $Vb, 71: $Vc, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }), o($VS, [2, 55]), o($VT, $VC, { 8: 7, 12: 8, 14: 10, 16: 11, 17: 12, 19: 13, 64: 14, 67: 15, 20: 16, 21: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 58: 23, 68: 24, 70: 35, 72: 37, 30: 65, 7: 67, 10: 173, 28: 174, 13: $V0, 27: $V1, 31: $VU, 32: $V3, 39: $V4, 41: $V5, 42: $V6, 50: $V7, 56: $V8, 57: $V9, 60: $Va, 69: $Vb, 71: $Vc, 73: $Vd, 75: $Ve, 76: $Vf, 77: $Vg, 78: $Vh, 79: $Vi, 80: $Vj, 81: $Vk, 83: $Vl }), { 52: 175, 53: [2, 58], 54: $VN, 55: $VO }, o($VM, $VC, { 10: 176, 31: $VD }), o($VM, $VC, { 10: 177, 31: $VD }), { 44: [2, 47] }, { 44: [2, 48], 49: [1, 178] }, { 10: 180, 31: $VD, 44: $VC, 49: [1, 179] }, { 53: [2, 59] }, o($VM, [2, 50]), o($VM, [2, 51]), o($VM, $VC, { 10: 181, 31: $VD }), o($VM, $VC, { 10: 182, 31: $VD }), { 44: [2, 49] }, o($VM, [2, 52]), o($VM, [2, 53])],
      defaultActions: { 34: [2, 66], 48: [2, 2], 88: [2, 1], 90: [2, 3], 114: [2, 4], 149: [2, 43], 155: [2, 60], 158: [2, 42], 172: [2, 47], 175: [2, 59], 180: [2, 49] },
      parseError: function parseError(str, hash) {
        if (hash.recoverable) {
          this.trace(str);
        } else {
          let _parseError2 = function(msg, hash2) {
            this.message = msg;
            this.hash = hash2;
          };
          var _parseError = _parseError2;
          _parseError2.prototype = Error;
          throw new _parseError2(str, hash);
        }
      },
      parse: function parse(input) {
        var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
        var args2 = lstack.slice.call(arguments, 1);
        var lexer = Object.create(this.lexer);
        var sharedState = { yy: {} };
        for (var k in this.yy) {
          if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
            sharedState.yy[k] = this.yy[k];
          }
        }
        lexer.setInput(input, sharedState.yy);
        sharedState.yy.lexer = lexer;
        sharedState.yy.parser = this;
        if (typeof lexer.yylloc == "undefined") {
          lexer.yylloc = {};
        }
        var yyloc = lexer.yylloc;
        lstack.push(yyloc);
        var ranges = lexer.options && lexer.options.ranges;
        if (typeof sharedState.yy.parseError === "function") {
          this.parseError = sharedState.yy.parseError;
        } else {
          this.parseError = Object.getPrototypeOf(this).parseError;
        }
        function popStack(n) {
          stack.length = stack.length - 2 * n;
          vstack.length = vstack.length - n;
          lstack.length = lstack.length - n;
        }
        _token_stack:
          var lex = function() {
            var token;
            token = lexer.lex() || EOF;
            if (typeof token !== "number") {
              token = self.symbols_[token] || token;
            }
            return token;
          };
        var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
        while (true) {
          state = stack[stack.length - 1];
          if (this.defaultActions[state]) {
            action = this.defaultActions[state];
          } else {
            if (symbol === null || typeof symbol == "undefined") {
              symbol = lex();
            }
            action = table[state] && table[state][symbol];
          }
          if (typeof action === "undefined" || !action.length || !action[0]) {
            var errStr = "";
            expected = [];
            for (p in table[state]) {
              if (this.terminals_[p] && p > TERROR) {
                expected.push("'" + this.terminals_[p] + "'");
              }
            }
            if (lexer.showPosition) {
              errStr = "Parse error on line " + (yylineno + 1) + `:
` + lexer.showPosition() + `
Expecting ` + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
            } else {
              errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == EOF ? "end of input" : "'" + (this.terminals_[symbol] || symbol) + "'");
            }
            this.parseError(errStr, {
              text: lexer.match,
              token: this.terminals_[symbol] || symbol,
              line: lexer.yylineno,
              loc: yyloc,
              expected
            });
          }
          if (action[0] instanceof Array && action.length > 1) {
            throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
          }
          switch (action[0]) {
            case 1:
              stack.push(symbol);
              vstack.push(lexer.yytext);
              lstack.push(lexer.yylloc);
              stack.push(action[1]);
              symbol = null;
              if (!preErrorSymbol) {
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                if (recovering > 0) {
                  recovering--;
                }
              } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
              }
              break;
            case 2:
              len = this.productions_[action[1]][1];
              yyval.$ = vstack[vstack.length - len];
              yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
              };
              if (ranges) {
                yyval._$.range = [
                  lstack[lstack.length - (len || 1)].range[0],
                  lstack[lstack.length - 1].range[1]
                ];
              }
              r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                sharedState.yy,
                action[1],
                vstack,
                lstack
              ].concat(args2));
              if (typeof r !== "undefined") {
                return r;
              }
              if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
              }
              stack.push(this.productions_[action[1]][0]);
              vstack.push(yyval.$);
              lstack.push(yyval._$);
              newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
              stack.push(newState);
              break;
            case 3:
              return true;
          }
        }
        return true;
      }
    };
    function Parser() {
      this.yy = {};
    }
    Parser.prototype = parser2;
    parser2.Parser = Parser;
    return new Parser;
  }();
  if (typeof exports !== "undefined") {
    exports.parser = parser;
    exports.Parser = parser.Parser;
    exports.parse = function() {
      return parser.parse.apply(parser, arguments);
    };
    exports.main = function commonjsMain(args2) {
      if (!args2[1]) {
        console.log("Usage: " + args2[0] + " FILE");
        process.exit(1);
      }
      var source = __require("fs").readFileSync(__require("path").normalize(args2[1]), "utf8");
      return exports.parser.parse(source);
    };
    if (typeof module !== "undefined" && false) {}
  }
});

// node_modules/bash-parser/src/modes/posix/index.js
var require_posix = __commonJS((exports, module) => {
  var astBuilder = require_ast_builder();
  var tokenizer = require_tokenizer();
  var phaseCatalog = require_rules();
  var grammarSource = require_grammar();
  var enums = require_enums();
  var lexerPhases = () => [
    phaseCatalog.newLineList,
    phaseCatalog.operatorTokens,
    phaseCatalog.separator,
    phaseCatalog.reservedWords,
    phaseCatalog.linebreakIn,
    phaseCatalog.ioNumber,
    phaseCatalog.identifyMaybeSimpleCommands,
    phaseCatalog.assignmentWord,
    phaseCatalog.parameterExpansion,
    phaseCatalog.arithmeticExpansion,
    phaseCatalog.commandExpansion,
    phaseCatalog.forNameVariable,
    phaseCatalog.functionName,
    phaseCatalog.identifySimpleCommandNames,
    phaseCatalog.aliasSubstitution,
    phaseCatalog.tildeExpanding,
    phaseCatalog.parameterExpansion.resolve,
    phaseCatalog.commandExpansion.resolve,
    phaseCatalog.arithmeticExpansion.resolve,
    phaseCatalog.fieldSplitting.split,
    phaseCatalog.pathExpansion,
    phaseCatalog.quoteRemoval,
    phaseCatalog.syntaxerrorOnContinue,
    phaseCatalog.defaultNodeType
  ];
  module.exports = {
    inherits: null,
    init: (posixMode, utils) => {
      let grammar = null;
      try {
        grammar = require_built_grammar();
      } catch (err) {}
      return {
        enums,
        phaseCatalog,
        lexerPhases: lexerPhases(utils),
        tokenizer,
        grammarSource,
        grammar,
        astBuilder
      };
    }
  };
});

// node_modules/bash-parser/src/modes/word-expansion/index.js
var require_word_expansion = __commonJS((exports, module) => {
  var map = require_map_iterable();
  var tokenOrEmpty = require_tokens().tokenOrEmpty;
  var convertToWord = () => map((tk) => {
    if (tk.is("TOKEN")) {
      return tk.changeTokenType("WORD", tk.value);
    }
    return tk;
  });
  function start(state, source, reducers) {
    const char = source && source.shift();
    if (char === undefined) {
      return {
        nextReduction: reducers.end,
        tokensToEmit: tokenOrEmpty(state),
        nextState: state.resetCurrent().saveCurrentLocAsStart()
      };
    }
    if (state.escaping && char === `
`) {
      return {
        nextReduction: reducers.start,
        nextState: state.setEscaping(false).removeLastChar()
      };
    }
    if (!state.escaping && char === "\\") {
      return {
        nextReduction: reducers.start,
        nextState: state.setEscaping(true).appendChar(char)
      };
    }
    if (!state.escaping && char === "'") {
      return {
        nextReduction: reducers.singleQuoting,
        nextState: state.appendChar(char)
      };
    }
    if (!state.escaping && char === '"') {
      return {
        nextReduction: reducers.doubleQuoting,
        nextState: state.appendChar(char)
      };
    }
    if (!state.escaping && char === "$") {
      return {
        nextReduction: reducers.expansionStart,
        nextState: state.appendChar(char).appendEmptyExpansion()
      };
    }
    if (!state.escaping && char === "`") {
      return {
        nextReduction: reducers.expansionCommandTick,
        nextState: state.appendChar(char).appendEmptyExpansion()
      };
    }
    return {
      nextReduction: reducers.start,
      nextState: state.appendChar(char).setEscaping(false)
    };
  }
  module.exports = {
    inherits: "posix",
    init: (posixMode) => {
      const phaseCatalog = posixMode.phaseCatalog;
      const lexerPhases = [
        convertToWord,
        phaseCatalog.parameterExpansion,
        phaseCatalog.arithmeticExpansion,
        phaseCatalog.commandExpansion,
        phaseCatalog.tildeExpanding,
        phaseCatalog.parameterExpansion.resolve,
        phaseCatalog.commandExpansion.resolve,
        phaseCatalog.arithmeticExpansion.resolve,
        phaseCatalog.fieldSplitting.split,
        phaseCatalog.pathExpansion,
        phaseCatalog.quoteRemoval,
        phaseCatalog.defaultNodeType
      ];
      const reducers = Object.assign({}, posixMode.tokenizer.reducers, { start });
      const tokenizer = () => posixMode.tokenizer({}, reducers);
      return Object.assign({}, posixMode, { lexerPhases, tokenizer });
    }
  };
});

// node_modules/bash-parser/src/index.js
var require_src = __commonJS((exports, module) => {
  var shellLexer = require_shell_lexer();
  var utils = require_utils();
  var modes = {
    bash: require_bash(),
    posix: require_posix(),
    "word-expansion": require_word_expansion()
  };
  function loadPlugin(name) {
    const modePlugin = modes[name];
    if (modePlugin.inherits) {
      return modePlugin.init(loadPlugin(modePlugin.inherits), utils);
    }
    return modePlugin.init(null, utils);
  }
  module.exports = function parse(sourceCode, options) {
    try {
      options = options || {};
      options.mode = options.mode || "posix";
      const mode = loadPlugin(options.mode);
      const Parser = mode.grammar.Parser;
      const astBuilder = mode.astBuilder;
      const parser = new Parser;
      parser.lexer = shellLexer(mode, options);
      parser.yy = astBuilder(options);
      const ast = parser.parse(sourceCode);
      return ast;
    } catch (err) {
      if (err instanceof SyntaxError) {
        throw err;
      }
      throw new Error(err.stack || err.message);
    }
  };
});

// src/pre-tool-hook.ts
import { appendFile, mkdir as mkdir2 } from "fs/promises";
import { resolve } from "path";

// node_modules/zod/v3/external.js
var exports_external = {};
__export(exports_external, {
  void: () => voidType,
  util: () => util,
  unknown: () => unknownType,
  union: () => unionType,
  undefined: () => undefinedType,
  tuple: () => tupleType,
  transformer: () => effectsType,
  symbol: () => symbolType,
  string: () => stringType,
  strictObject: () => strictObjectType,
  setErrorMap: () => setErrorMap,
  set: () => setType,
  record: () => recordType,
  quotelessJson: () => quotelessJson,
  promise: () => promiseType,
  preprocess: () => preprocessType,
  pipeline: () => pipelineType,
  ostring: () => ostring,
  optional: () => optionalType,
  onumber: () => onumber,
  oboolean: () => oboolean,
  objectUtil: () => objectUtil,
  object: () => objectType,
  number: () => numberType,
  nullable: () => nullableType,
  null: () => nullType,
  never: () => neverType,
  nativeEnum: () => nativeEnumType,
  nan: () => nanType,
  map: () => mapType,
  makeIssue: () => makeIssue,
  literal: () => literalType,
  lazy: () => lazyType,
  late: () => late,
  isValid: () => isValid,
  isDirty: () => isDirty,
  isAsync: () => isAsync,
  isAborted: () => isAborted,
  intersection: () => intersectionType,
  instanceof: () => instanceOfType,
  getParsedType: () => getParsedType,
  getErrorMap: () => getErrorMap,
  function: () => functionType,
  enum: () => enumType,
  effect: () => effectsType,
  discriminatedUnion: () => discriminatedUnionType,
  defaultErrorMap: () => en_default,
  datetimeRegex: () => datetimeRegex,
  date: () => dateType,
  custom: () => custom,
  coerce: () => coerce,
  boolean: () => booleanType,
  bigint: () => bigIntType,
  array: () => arrayType,
  any: () => anyType,
  addIssueToContext: () => addIssueToContext,
  ZodVoid: () => ZodVoid,
  ZodUnknown: () => ZodUnknown,
  ZodUnion: () => ZodUnion,
  ZodUndefined: () => ZodUndefined,
  ZodType: () => ZodType,
  ZodTuple: () => ZodTuple,
  ZodTransformer: () => ZodEffects,
  ZodSymbol: () => ZodSymbol,
  ZodString: () => ZodString,
  ZodSet: () => ZodSet,
  ZodSchema: () => ZodType,
  ZodRecord: () => ZodRecord,
  ZodReadonly: () => ZodReadonly,
  ZodPromise: () => ZodPromise,
  ZodPipeline: () => ZodPipeline,
  ZodParsedType: () => ZodParsedType,
  ZodOptional: () => ZodOptional,
  ZodObject: () => ZodObject,
  ZodNumber: () => ZodNumber,
  ZodNullable: () => ZodNullable,
  ZodNull: () => ZodNull,
  ZodNever: () => ZodNever,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNaN: () => ZodNaN,
  ZodMap: () => ZodMap,
  ZodLiteral: () => ZodLiteral,
  ZodLazy: () => ZodLazy,
  ZodIssueCode: () => ZodIssueCode,
  ZodIntersection: () => ZodIntersection,
  ZodFunction: () => ZodFunction,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodError: () => ZodError,
  ZodEnum: () => ZodEnum,
  ZodEffects: () => ZodEffects,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodDefault: () => ZodDefault,
  ZodDate: () => ZodDate,
  ZodCatch: () => ZodCatch,
  ZodBranded: () => ZodBranded,
  ZodBoolean: () => ZodBoolean,
  ZodBigInt: () => ZodBigInt,
  ZodArray: () => ZodArray,
  ZodAny: () => ZodAny,
  Schema: () => ZodType,
  ParseStatus: () => ParseStatus,
  OK: () => OK,
  NEVER: () => NEVER,
  INVALID: () => INVALID,
  EMPTY_PATH: () => EMPTY_PATH,
  DIRTY: () => DIRTY,
  BRAND: () => BRAND
});

// node_modules/zod/v3/helpers/util.js
var util;
(function(util2) {
  util2.assertEqual = (_) => {};
  function assertIs(_arg) {}
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error;
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};

// node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = (obj) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
};

class ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
}
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};

// node_modules/zod/v3/locales/en.js
var errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
var en_default = errorMap;

// node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}
// node_modules/zod/v3/helpers/parseUtil.js
var makeIssue = (params) => {
  const { data, path, errorMaps, issueData } = params;
  const fullPath = [...path, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== undefined) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
};
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      ctx.schemaErrorMap,
      overrideMap,
      overrideMap === en_default ? undefined : en_default
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}

class ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
}
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x) => x.status === "aborted";
var isDirty = (x) => x.status === "dirty";
var isValid = (x) => x.status === "valid";
var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;
// node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

// node_modules/zod/v3/types.js
class ParseInputLazyPath {
  constructor(parent, value, path, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
}
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}

class ZodType {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus,
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if (err?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(undefined).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args2) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args2.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args2.precision}}`;
  } else if (args2.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args2.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args2) {
  return new RegExp(`^${timeRegexSource(args2)}$`);
}
function datetimeRegex(args2) {
  let regex = `${dateRegexSource}T${timeRegexSource(args2)}`;
  const opts = [];
  opts.push(args2.local ? `Z?` : `Z`);
  if (args2.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}

class ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus;
    let ctx = undefined;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...errorUtil.errToObj(options?.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      ...errorUtil.errToObj(options?.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
}
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}

class ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = undefined;
    const status = new ParseStatus;
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
}
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};

class ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = undefined;
    const status = new ParseStatus;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
}
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};

class ZodBoolean extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};

class ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus;
    let ctx = undefined;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
}
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};

class ZodSymbol extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};

class ZodUndefined extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};

class ZodNull extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};

class ZodAny extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
}
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};

class ZodUnknown extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
}
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};

class ZodNever extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
}
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};

class ZodVoid extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};

class ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : undefined,
          maximum: tooBig ? def.exactLength.value : undefined,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
}
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}

class ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    this._cached = { shape, keys };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") {} else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== undefined ? {
        errorMap: (issue, ctx) => {
          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: errorUtil.errToObj(message).message ?? defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  extend(augmentation) {
    return new ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  merge(merging) {
    const merged = new ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  catchall(index) {
    return new ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }
    return new ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    }
    return new ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
}
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};

class ZodUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = undefined;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
}
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [undefined];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [undefined, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};

class ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  static create(discriminator, options, params) {
    const optionsMap = new Map;
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
}
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0;index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}

class ZodIntersection extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
}
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};

class ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new ZodTuple({
      ...this._def,
      rest
    });
  }
}
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};

class ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
}

class ZodMap extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = new Map;
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = new Map;
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
}
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};

class ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = new Set;
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
}
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};

class ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args2, error) {
      return makeIssue({
        data: args2,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn2 = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args2) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args2, params).catch((e) => {
          error.addIssue(makeArgsIssue(args2, e));
          throw error;
        });
        const result = await Reflect.apply(fn2, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args2) {
        const parsedArgs = me._def.args.safeParse(args2, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args2, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn2, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args2, returns, params) {
    return new ZodFunction({
      args: args2 ? args2 : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
}

class ZodLazy extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
}
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};

class ZodLiteral extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
}
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}

class ZodEnum extends ZodType {
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
}
ZodEnum.create = createZodEnum;

class ZodNativeEnum extends ZodType {
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
}
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};

class ZodPromise extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
}
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};

class ZodEffects extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return INVALID;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return INVALID;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
            status: status.value,
            value: result
          }));
        });
      }
    }
    util.assertNever(effect);
  }
}
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
class ZodOptional extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(undefined);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};

class ZodNullable extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};

class ZodDefault extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
}
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};

class ZodCatch extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
}
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};

class ZodNaN extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
}
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = Symbol("zod_brand");

class ZodBranded extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
}

class ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
}

class ZodReadonly extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: (arg) => ZodString.create({ ...arg, coerce: true }),
  number: (arg) => ZodNumber.create({ ...arg, coerce: true }),
  boolean: (arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  }),
  bigint: (arg) => ZodBigInt.create({ ...arg, coerce: true }),
  date: (arg) => ZodDate.create({ ...arg, coerce: true })
};
var NEVER = INVALID;
// src/crypto.ts
import { createHash, generateKeyPairSync, sign, verify } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}
function base64url(value) {
  return Buffer.from(value).toString("base64url");
}
var CapabilityClaims = exports_external.object({
  operationId: exports_external.string().uuid(),
  kind: exports_external.enum(["filesystem.delete", "sqlite.mutate", "git.reset-hard", "postgres.schema-mutate"]),
  proofDigest: exports_external.string(),
  stateWitness: exports_external.string(),
  statementDigest: exports_external.string().nullable().default(null),
  expiresAt: exports_external.string().datetime()
});

class CapabilitySigner {
  privateKey;
  publicKey;
  constructor(privateKey, publicKey) {
    this.privateKey = privateKey;
    this.publicKey = publicKey;
  }
  static async load(dataDir) {
    await mkdir(dataDir, { recursive: true, mode: 448 });
    const privatePath = join(dataDir, "authority-private.pem");
    const publicPath = join(dataDir, "authority-public.pem");
    try {
      const [privateKey, publicKey] = await Promise.all([
        readFile(privatePath, "utf8"),
        readFile(publicPath, "utf8")
      ]);
      return new CapabilitySigner(privateKey, publicKey);
    } catch {
      const pair = generateKeyPairSync("ed25519", {
        privateKeyEncoding: { type: "pkcs8", format: "pem" },
        publicKeyEncoding: { type: "spki", format: "pem" }
      });
      await Promise.all([
        writeFile(privatePath, pair.privateKey, { mode: 384 }),
        writeFile(publicPath, pair.publicKey, { mode: 420 })
      ]);
      return new CapabilitySigner(pair.privateKey, pair.publicKey);
    }
  }
  issue(claims) {
    const payload = base64url(JSON.stringify(claims));
    const signature = sign(null, Buffer.from(payload), this.privateKey);
    return `${payload}.${base64url(signature)}`;
  }
  verify(token) {
    const [payload, encodedSignature, extra] = token.split(".");
    if (!payload || !encodedSignature || extra) {
      throw new Error("Malformed capability token");
    }
    const valid = verify(null, Buffer.from(payload), this.publicKey, Buffer.from(encodedSignature, "base64url"));
    if (!valid)
      throw new Error("Invalid capability signature");
    const claims = CapabilityClaims.parse(JSON.parse(Buffer.from(payload, "base64url").toString("utf8")));
    if (Date.parse(claims.expiresAt) <= Date.now())
      throw new Error("Capability expired");
    return claims;
  }
}

// src/shell-policy.ts
var import_bash_parser = __toESM(require_src(), 1);
import { basename } from "path";
function text(value) {
  if (!value || typeof value !== "object")
    return;
  const candidate = value.text;
  return typeof candidate === "string" ? candidate : undefined;
}
function commandWords(node) {
  const name = text(node.name);
  if (!name)
    return [];
  const suffix = Array.isArray(node.suffix) ? node.suffix.map(text).filter((word) => Boolean(word)) : [];
  return [name, ...suffix];
}
function unwrap(words) {
  let remaining = [...words];
  while (remaining.length > 0) {
    const executable = basename(remaining[0] ?? "");
    if (executable === "sudo" || executable === "command" || executable === "builtin" || executable === "nohup") {
      remaining = remaining.slice(1);
      while (remaining[0]?.startsWith("-"))
        remaining = remaining.slice(1);
      continue;
    }
    if (executable === "env") {
      remaining = remaining.slice(1);
      while (remaining[0] && (remaining[0].startsWith("-") || remaining[0].includes("=")))
        remaining = remaining.slice(1);
      continue;
    }
    break;
  }
  return remaining;
}
function finding(category, executable, reason) {
  return {
    category,
    executable,
    reason,
    adapterAvailable: category === "filesystem.delete" || category === "sqlite.mutate" || category === "postgres.schema-mutate" || category === "git.reset-hard"
  };
}
function classifyWords(input) {
  const words = unwrap(input);
  const executable = basename(words[0] ?? "").toLowerCase();
  const args2 = words.slice(1);
  if (!executable)
    return [];
  if (executable === "approve-operation.sh" || executable === "recovery-authority-approve" || ["bash", "sh", "zsh", "dash", "bun", "node"].includes(executable) && args2.some((arg) => /(?:^|\/)(?:approve-operation\.sh|approve\.js|approve\.ts)$/.test(arg))) {
    return [finding("authorization.approval", executable, "human approval must happen outside the coding agent session")];
  }
  if (["rm", "unlink", "shred", "rmdir"].includes(executable)) {
    return [finding("filesystem.delete", executable, `${executable} removes filesystem state`)];
  }
  if (executable === "find" && args2.some((arg) => arg === "-delete" || arg === "-exec" || arg === "-execdir")) {
    return [finding("filesystem.delete", executable, "find can delete or invoke a destructive command over many paths")];
  }
  if (executable === "truncate" || executable === "dd" && args2.some((arg) => arg.startsWith("of="))) {
    return [finding("filesystem.overwrite", executable, `${executable} can irreversibly overwrite file contents`)];
  }
  if (executable === "git") {
    let index = 0;
    while (index < args2.length && args2[index]?.startsWith("-")) {
      if (["-C", "-c", "--git-dir", "--work-tree", "--namespace"].includes(args2[index] ?? ""))
        index += 2;
      else
        index += 1;
    }
    const subcommand = args2[index];
    const subcommandArgs = args2.slice(index + 1);
    if (subcommand === "reset" && subcommandArgs.includes("--hard")) {
      return [finding("git.reset-hard", executable, "git reset --hard discards index and worktree state")];
    }
    if (subcommand === "clean" || subcommand === "restore" || subcommand === "checkout") {
      return [finding("git.destructive", executable, `git ${subcommand} can discard uncommitted state`)];
    }
  }
  if (["psql", "mysql", "sqlite3", "mongosh"].includes(executable)) {
    const statement = args2.join(" ");
    if (/\b(drop|truncate|delete\s+from|update\s+|alter\s+table)\b/i.test(statement)) {
      if (executable === "sqlite3") {
        return [finding("sqlite.mutate", executable, "sqlite3 contains a destructive database statement")];
      }
      if (executable === "psql") {
        return [finding("postgres.schema-mutate", executable, "psql contains a destructive PostgreSQL statement")];
      }
      return [finding("database.destructive", executable, `${executable} contains a destructive database statement`)];
    }
  }
  if (executable === "terraform" && args2.some((arg) => arg === "destroy" || arg === "apply")) {
    return [finding("infrastructure.destructive", executable, `terraform ${args2[0] ?? "operation"} can destroy remote infrastructure`)];
  }
  if (executable === "kubectl" && args2.includes("delete")) {
    return [finding("infrastructure.destructive", executable, "kubectl delete removes cluster resources")];
  }
  if (["aws", "gcloud", "az"].includes(executable) && args2.some((arg) => ["delete", "remove", "rm", "terminate-instances"].includes(arg))) {
    return [finding("infrastructure.destructive", executable, `${executable} command removes remote resources`)];
  }
  if (["sh", "bash", "zsh", "dash"].includes(executable)) {
    const commandFlag = args2.findIndex((arg) => arg === "-c" || arg === "-lc");
    const nestedCommand = commandFlag >= 0 ? args2[commandFlag + 1] : undefined;
    if (nestedCommand)
      return analyzeShellCommand(nestedCommand);
    if (args2.some((arg) => !arg.startsWith("-"))) {
      return [finding("opaque.execution", executable, `${executable} executes a script whose effects are not represented in this tool call`)];
    }
  }
  return [];
}
function walk(value, findings) {
  if (Array.isArray(value)) {
    value.forEach((item) => walk(item, findings));
    return;
  }
  if (!value || typeof value !== "object")
    return;
  const node = value;
  if (node.type === "Command")
    findings.push(...classifyWords(commandWords(node)));
  for (const nested of Object.values(node))
    walk(nested, findings);
}
function analyzeShellCommand(source) {
  let ast;
  try {
    ast = import_bash_parser.default(source);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return [finding("opaque.execution", "shell", `Shell syntax could not be analyzed: ${message}`)];
  }
  const findings = [];
  walk(ast, findings);
  return [...new Map(findings.map((item) => [`${item.category}:${item.executable}:${item.reason}`, item])).values()];
}

// src/pre-tool-hook.ts
var HookInput = exports_external.object({
  hook_event_name: exports_external.literal("PreToolUse"),
  session_id: exports_external.string().optional(),
  turn_id: exports_external.string().optional(),
  cwd: exports_external.string(),
  tool_name: exports_external.string(),
  tool_input: exports_external.record(exports_external.unknown())
});
function commandFrom(input) {
  for (const key of ["command", "cmd"]) {
    const value = input.tool_input[key];
    if (typeof value === "string")
      return value;
  }
  return null;
}
function evaluateHook(rawInput) {
  const input = HookInput.parse(rawInput);
  const command = commandFrom(input);
  if (!command)
    return { blocked: false, command: null, findings: [], output: null };
  const findings = analyzeShellCommand(command);
  if (findings.length === 0)
    return { blocked: false, command, findings, output: null };
  const categories = [...new Set(findings.map((item) => item.category))];
  const categorySet = new Set(categories);
  let nextStep;
  if (categorySet.size === 1 && categorySet.has("filesystem.delete")) {
    nextStep = "Call recovery_prepare_filesystem_delete with the exact workspace-relative paths, then use the returned capability with recovery_commit_filesystem_delete.";
  } else if (categorySet.size === 1 && categorySet.has("sqlite.mutate")) {
    nextStep = "Call recovery_prepare_sqlite_mutation with the exact database path and SQL, then use the returned capability with recovery_commit_sqlite_mutation.";
  } else if (categorySet.size === 1 && categorySet.has("git.reset-hard")) {
    nextStep = "Call recovery_prepare_git_reset_hard with the repository root and target commit, then use the returned capability with recovery_commit_git_reset_hard.";
  } else if (categorySet.size === 1 && categorySet.has("postgres.schema-mutate")) {
    nextStep = "Call recovery_prepare_postgres_mutation with the connection URI, authorized schema, and exact SQL, then use the returned capability with recovery_commit_postgres_mutation.";
  } else {
    nextStep = "No single exact recovery adapter covers every detected effect. Do not bypass this hook through another shell wrapper; narrow the operation or ask the user for a supported recovery plan.";
  }
  const reason = `Recovery Authority blocked this command before execution. Detected: ${categories.join(", ")}. ${nextStep}`;
  return {
    blocked: true,
    command,
    findings,
    output: {
      systemMessage: reason,
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason
      }
    }
  };
}
async function recordDecision(input, decision) {
  const dataDir = resolve(process.env.PLUGIN_DATA ?? process.env.RECOVERY_AUTHORITY_DATA_DIR ?? ".recovery-authority");
  await mkdir2(dataDir, { recursive: true, mode: 448 });
  await appendFile(resolve(dataDir, "hook-events.jsonl"), `${JSON.stringify({
    timestamp: new Date().toISOString(),
    sessionId: input.session_id ?? null,
    turnId: input.turn_id ?? null,
    cwd: input.cwd,
    toolName: input.tool_name,
    commandDigest: decision.command ? sha256(decision.command) : null,
    blocked: decision.blocked,
    findings: decision.findings
  })}
`, { mode: 384 });
}
async function main() {
  const chunks = [];
  for await (const chunk of process.stdin)
    chunks.push(Buffer.from(chunk));
  const rawInput = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  const parsedInput = HookInput.parse(rawInput);
  const decision = evaluateHook(parsedInput);
  await recordDecision(parsedInput, decision).catch(() => {
    return;
  });
  if (decision.output)
    process.stdout.write(`${JSON.stringify(decision.output)}
`);
}
if (import.meta.main)
  await main();
export {
  evaluateHook
};
