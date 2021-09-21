
// We are modularizing this manually because the current modularize setting in Emscripten has some issues:
// https://github.com/kripken/emscripten/issues/5820
// In addition, When you use emcc's modularization, it still expects to export a global object called `Module`,
// which is able to be used/called before the WASM is loaded.
// The modularization below exports a promise that loads and resolves to the actual sql.js module.
// That way, this module can't be used before the WASM is finished loading.

// We are going to define a function that a user will call to start loading initializing our Sql.js library
// However, that function might be called multiple times, and on subsequent calls, we don't actually want it to instantiate a new instance of the Module
// Instead, we want to return the previously loaded module

// TODO: Make this not declare a global if used in the browser
var initSqlJsPromise = undefined;

var initSqlJs = async function (moduleConfig) {

    if (initSqlJsPromise){
      return initSqlJsPromise;
    }
    // If we're here, we've never called this function before
    initSqlJsPromise = new Promise(function (resolveModule, reject) {

        // We are modularizing this manually because the current modularize setting in Emscripten has some issues:
        // https://github.com/kripken/emscripten/issues/5820

        // The way to affect the loading of emcc compiled modules is to create a variable called `Module` and add
        // properties to it, like `preRun`, `postRun`, etc
        // We are using that to get notified when the WASM has finished loading.
        // Only then will we return our promise

        // If they passed in a moduleConfig object, use that
        // Otherwise, initialize Module to the empty object
        var Module = typeof moduleConfig !== 'undefined' ? moduleConfig : {};

        // EMCC only allows for a single onAbort function (not an array of functions)
        // So if the user defined their own onAbort function, we remember it and call it
        var originalOnAbortFunction = Module['onAbort'];
        Module['onAbort'] = function (errorThatCausedAbort) {
            reject(new Error(errorThatCausedAbort));
            if (originalOnAbortFunction){
              originalOnAbortFunction(errorThatCausedAbort);
            }
        };

        Module['postRun'] = Module['postRun'] || [];
        Module['postRun'].push(function () {
            // When Emscripted calls postRun, this promise resolves with the built Module
            resolveModule(Module);
        });

        // There is a section of code in the emcc-generated code below that looks like this:
        // (Note that this is lowercase `module`)
        // if (typeof module !== 'undefined') {
        //     module['exports'] = Module;
        // }
        // When that runs, it's going to overwrite our own modularization export efforts in shell-post.js!
        // The only way to tell emcc not to emit it is to pass the MODULARIZE=1 or MODULARIZE_INSTANCE=1 flags,
        // but that carries with it additional unnecessary baggage/bugs we don't want either.
        // So, we have three options:
        // 1) We undefine `module`
        // 2) We remember what `module['exports']` was at the beginning of this function and we restore it later
        // 3) We write a script to remove those lines of code as part of the Make process.
        //
        // Since those are the only lines of code that care about module, we will undefine it. It's the most straightforward
        // of the options, and has the side effect of reducing emcc's efforts to modify the module if its output were to change in the future.
        // That's a nice side effect since we're handling the modularization efforts ourselves
        module = undefined;

        // The emcc-generated code and shell-post.js code goes below,
        // meaning that all of it runs inside of this promise. If anything throws an exception, our promise will abort

var e;e||(e=typeof Module !== 'undefined' ? Module : {});null;
e.onRuntimeInitialized=function(){function a(h,l){this.Ra=h;this.db=l;this.Qa=1;this.lb=[]}function b(h,l){this.db=l;l=aa(h)+1;this.eb=da(l);if(null===this.eb)throw Error("Unable to allocate memory for the SQL string");k(h,m,this.eb,l);this.jb=this.eb;this.$a=this.pb=null}function c(h){this.filename="dbfile_"+(4294967295*Math.random()>>>0);if(null!=h){var l=this.filename,q=l?r("//"+l):"/";l=ea(!0,!0);q=fa(q,(void 0!==l?l:438)&4095|32768,0);if(h){if("string"===typeof h){for(var p=Array(h.length),z=
0,M=h.length;z<M;++z)p[z]=h.charCodeAt(z);h=p}ha(q,l|146);p=ia(q,577);ka(p,h,0,h.length,0,void 0);la(p);ha(q,l)}}this.handleError(g(this.filename,d));this.db=v(d,"i32");lc(this.db);this.fb={};this.Xa={}}var d=x(4),f=e.cwrap,g=f("sqlite3_open","number",["string","number"]),n=f("sqlite3_close_v2","number",["number"]),t=f("sqlite3_exec","number",["number","string","number","number","number"]),w=f("sqlite3_changes","number",["number"]),u=f("sqlite3_prepare_v2","number",["number","string","number","number",
"number"]),C=f("sqlite3_sql","string",["number"]),H=f("sqlite3_normalized_sql","string",["number"]),ba=f("sqlite3_prepare_v2","number",["number","number","number","number","number"]),mc=f("sqlite3_bind_text","number",["number","number","number","number","number"]),rb=f("sqlite3_bind_blob","number",["number","number","number","number","number"]),nc=f("sqlite3_bind_double","number",["number","number","number"]),oc=f("sqlite3_bind_int","number",["number","number","number"]),pc=f("sqlite3_bind_parameter_index",
"number",["number","string"]),qc=f("sqlite3_step","number",["number"]),rc=f("sqlite3_errmsg","string",["number"]),sc=f("sqlite3_column_count","number",["number"]),tc=f("sqlite3_data_count","number",["number"]),uc=f("sqlite3_column_double","number",["number","number"]),sb=f("sqlite3_column_text","string",["number","number"]),vc=f("sqlite3_column_blob","number",["number","number"]),wc=f("sqlite3_column_bytes","number",["number","number"]),xc=f("sqlite3_column_type","number",["number","number"]),yc=
f("sqlite3_column_name","string",["number","number"]),zc=f("sqlite3_reset","number",["number"]),Ac=f("sqlite3_clear_bindings","number",["number"]),Bc=f("sqlite3_finalize","number",["number"]),Cc=f("sqlite3_create_function_v2","number","number string number number number number number number number".split(" ")),Dc=f("sqlite3_value_type","number",["number"]),Ec=f("sqlite3_value_bytes","number",["number"]),Fc=f("sqlite3_value_text","string",["number"]),Gc=f("sqlite3_value_blob","number",["number"]),
Hc=f("sqlite3_value_double","number",["number"]),Ic=f("sqlite3_result_double","",["number","number"]),tb=f("sqlite3_result_null","",["number"]),Jc=f("sqlite3_result_text","",["number","string","number","number"]),Kc=f("sqlite3_result_blob","",["number","number","number","number"]),Lc=f("sqlite3_result_int","",["number","number"]),ub=f("sqlite3_result_error","",["number","string","number"]),lc=f("RegisterExtensionFunctions","number",["number"]);a.prototype.bind=function(h){if(!this.Ra)throw"Statement closed";
this.reset();return Array.isArray(h)?this.Eb(h):null!=h&&"object"===typeof h?this.Fb(h):!0};a.prototype.step=function(){if(!this.Ra)throw"Statement closed";this.Qa=1;var h=qc(this.Ra);switch(h){case 100:return!0;case 101:return!1;default:throw this.db.handleError(h);}};a.prototype.zb=function(h){null==h&&(h=this.Qa,this.Qa+=1);return uc(this.Ra,h)};a.prototype.Jb=function(h){null==h&&(h=this.Qa,this.Qa+=1);h=sb(this.Ra,h);if("function"!==typeof BigInt)throw Error("BigInt is not supported");return BigInt(h)};
a.prototype.Kb=function(h){null==h&&(h=this.Qa,this.Qa+=1);return sb(this.Ra,h)};a.prototype.getBlob=function(h){null==h&&(h=this.Qa,this.Qa+=1);var l=wc(this.Ra,h);h=vc(this.Ra,h);for(var q=new Uint8Array(l),p=0;p<l;p+=1)q[p]=y[h+p];return q};a.prototype.get=function(h,l){l=l||{};null!=h&&this.bind(h)&&this.step();h=[];for(var q=tc(this.Ra),p=0;p<q;p+=1)switch(xc(this.Ra,p)){case 1:var z=l.useBigInt?this.Jb(p):this.zb(p);h.push(z);break;case 2:h.push(this.zb(p));break;case 3:h.push(this.Kb(p));break;
case 4:h.push(this.getBlob(p));break;default:h.push(null)}return h};a.prototype.getColumnNames=function(){for(var h=[],l=sc(this.Ra),q=0;q<l;q+=1)h.push(yc(this.Ra,q));return h};a.prototype.getAsObject=function(h,l){h=this.get(h,l);l=this.getColumnNames();for(var q={},p=0;p<l.length;p+=1)q[l[p]]=h[p];return q};a.prototype.getSQL=function(){return C(this.Ra)};a.prototype.getNormalizedSQL=function(){return H(this.Ra)};a.prototype.run=function(h){null!=h&&this.bind(h);this.step();return this.reset()};
a.prototype.ub=function(h,l){null==l&&(l=this.Qa,this.Qa+=1);h=ma(h);var q=na(h);this.lb.push(q);this.db.handleError(mc(this.Ra,l,q,h.length-1,0))};a.prototype.Db=function(h,l){null==l&&(l=this.Qa,this.Qa+=1);var q=na(h);this.lb.push(q);this.db.handleError(rb(this.Ra,l,q,h.length,0))};a.prototype.tb=function(h,l){null==l&&(l=this.Qa,this.Qa+=1);this.db.handleError((h===(h|0)?oc:nc)(this.Ra,l,h))};a.prototype.Gb=function(h){null==h&&(h=this.Qa,this.Qa+=1);rb(this.Ra,h,0,0,0)};a.prototype.vb=function(h,
l){null==l&&(l=this.Qa,this.Qa+=1);switch(typeof h){case "string":this.ub(h,l);return;case "number":this.tb(h,l);return;case "bigint":this.ub(h.toString(),l);return;case "boolean":this.tb(h+0,l);return;case "object":if(null===h){this.Gb(l);return}if(null!=h.length){this.Db(h,l);return}}throw"Wrong API use : tried to bind a value of an unknown type ("+h+").";};a.prototype.Fb=function(h){var l=this;Object.keys(h).forEach(function(q){var p=pc(l.Ra,q);0!==p&&l.vb(h[q],p)});return!0};a.prototype.Eb=function(h){for(var l=
0;l<h.length;l+=1)this.vb(h[l],l+1);return!0};a.prototype.reset=function(){this.freemem();return 0===Ac(this.Ra)&&0===zc(this.Ra)};a.prototype.freemem=function(){for(var h;void 0!==(h=this.lb.pop());)oa(h)};a.prototype.free=function(){this.freemem();var h=0===Bc(this.Ra);delete this.db.fb[this.Ra];this.Ra=0;return h};b.prototype.next=function(){if(null===this.eb)return{done:!0};null!==this.$a&&(this.$a.free(),this.$a=null);if(!this.db.db)throw this.nb(),Error("Database closed");var h=pa(),l=x(4);
qa(d);qa(l);try{this.db.handleError(ba(this.db.db,this.jb,-1,d,l));this.jb=v(l,"i32");var q=v(d,"i32");if(0===q)return this.nb(),{done:!0};this.$a=new a(q,this.db);this.db.fb[q]=this.$a;return{value:this.$a,done:!1}}catch(p){throw this.pb=A(this.jb),this.nb(),p;}finally{ra(h)}};b.prototype.nb=function(){oa(this.eb);this.eb=null};b.prototype.getRemainingSQL=function(){return null!==this.pb?this.pb:A(this.jb)};"function"===typeof Symbol&&"symbol"===typeof Symbol.iterator&&(b.prototype[Symbol.iterator]=
function(){return this});c.prototype.run=function(h,l){if(!this.db)throw"Database closed";if(l){h=this.prepare(h,l);try{h.step()}finally{h.free()}}else this.handleError(t(this.db,h,0,0,d));return this};c.prototype.exec=function(h,l,q){if(!this.db)throw"Database closed";var p=pa(),z=null;try{var M=aa(h)+1,G=x(M);k(h,y,G,M);var ja=G;var ca=x(4);for(h=[];0!==v(ja,"i8");){qa(d);qa(ca);this.handleError(ba(this.db,ja,-1,d,ca));var D=v(d,"i32");ja=v(ca,"i32");if(0!==D){M=null;z=new a(D,this);for(null!=l&&
z.bind(l);z.step();)null===M&&(M={columns:z.getColumnNames(),values:[]},h.push(M)),M.values.push(z.get(null,q));z.free()}}return h}catch(N){throw z&&z.free(),N;}finally{ra(p)}};c.prototype.each=function(h,l,q,p,z){"function"===typeof l&&(p=q,q=l,l=void 0);h=this.prepare(h,l);try{for(;h.step();)q(h.getAsObject(null,z))}finally{h.free()}if("function"===typeof p)return p()};c.prototype.prepare=function(h,l){qa(d);this.handleError(u(this.db,h,-1,d,0));h=v(d,"i32");if(0===h)throw"Nothing to prepare";var q=
new a(h,this);null!=l&&q.bind(l);return this.fb[h]=q};c.prototype.iterateStatements=function(h){return new b(h,this)};c.prototype["export"]=function(){Object.values(this.fb).forEach(function(l){l.free()});Object.values(this.Xa).forEach(sa);this.Xa={};this.handleError(n(this.db));var h=ta(this.filename);this.handleError(g(this.filename,d));this.db=v(d,"i32");return h};c.prototype.close=function(){null!==this.db&&(Object.values(this.fb).forEach(function(h){h.free()}),Object.values(this.Xa).forEach(sa),
this.Xa={},this.handleError(n(this.db)),ua("/"+this.filename),this.db=null)};c.prototype.handleError=function(h){if(0===h)return null;h=rc(this.db);throw Error(h);};c.prototype.getRowsModified=function(){return w(this.db)};c.prototype.create_function=function(h,l){Object.prototype.hasOwnProperty.call(this.Xa,h)&&(sa(this.Xa[h]),delete this.Xa[h]);var q=va(function(p,z,M){for(var G,ja=[],ca=0;ca<z;ca+=1){var D=v(M+4*ca,"i32"),N=Dc(D);if(1===N||2===N)D=Hc(D);else if(3===N)D=Fc(D);else if(4===N){N=D;
D=Ec(N);N=Gc(N);for(var xb=new Uint8Array(D),Ba=0;Ba<D;Ba+=1)xb[Ba]=y[N+Ba];D=xb}else D=null;ja.push(D)}try{G=l.apply(null,ja)}catch(Oc){ub(p,Oc,-1);return}switch(typeof G){case "boolean":Lc(p,G?1:0);break;case "number":Ic(p,G);break;case "string":Jc(p,G,-1,-1);break;case "object":null===G?tb(p):null!=G.length?(z=na(G),Kc(p,z,G.length,-1),oa(z)):ub(p,"Wrong API use : tried to return a value of an unknown type ("+G+").",-1);break;default:tb(p)}});this.Xa[h]=q;this.handleError(Cc(this.db,h,l.length,
1,0,q,0,0,0));return this};e.Database=c};var wa={},B;for(B in e)e.hasOwnProperty(B)&&(wa[B]=e[B]);var xa="./this.program",ya=!1,za=!1,Aa=!1,Ca=!1;ya="object"===typeof window;za="function"===typeof importScripts;Aa="object"===typeof process&&"object"===typeof process.versions&&"string"===typeof process.versions.node;Ca=!ya&&!Aa&&!za;var E="",Da,Ea,Fa,Ga,Ha;
if(Aa)E=za?require("path").dirname(E)+"/":__dirname+"/",Da=function(a,b){Ga||(Ga=require("fs"));Ha||(Ha=require("path"));a=Ha.normalize(a);return Ga.readFileSync(a,b?null:"utf8")},Fa=function(a){a=Da(a,!0);a.buffer||(a=new Uint8Array(a));assert(a.buffer);return a},1<process.argv.length&&(xa=process.argv[1].replace(/\\/g,"/")),process.argv.slice(2),"undefined"!==typeof module&&(module.exports=e),e.inspect=function(){return"[Emscripten Module object]"};else if(Ca)"undefined"!=typeof read&&(Da=function(a){return read(a)}),
Fa=function(a){if("function"===typeof readbuffer)return new Uint8Array(readbuffer(a));a=read(a,"binary");assert("object"===typeof a);return a},"undefined"!==typeof print&&("undefined"===typeof console&&(console={}),console.log=print,console.warn=console.error="undefined"!==typeof printErr?printErr:print);else if(ya||za)za?E=self.location.href:"undefined"!==typeof document&&document.currentScript&&(E=document.currentScript.src),E=0!==E.indexOf("blob:")?E.substr(0,E.lastIndexOf("/")+1):"",Da=function(a){var b=
new XMLHttpRequest;b.open("GET",a,!1);b.send(null);return b.responseText},za&&(Fa=function(a){var b=new XMLHttpRequest;b.open("GET",a,!1);b.responseType="arraybuffer";b.send(null);return new Uint8Array(b.response)}),Ea=function(a,b,c){var d=new XMLHttpRequest;d.open("GET",a,!0);d.responseType="arraybuffer";d.onload=function(){200==d.status||0==d.status&&d.response?b(d.response):c()};d.onerror=c;d.send(null)};var Ia=e.print||console.log.bind(console),F=e.printErr||console.warn.bind(console);
for(B in wa)wa.hasOwnProperty(B)&&(e[B]=wa[B]);wa=null;e.thisProgram&&(xa=e.thisProgram);var Ja=[],Ka;function sa(a){Ka.delete(I.get(a));Ja.push(a)}
function va(a){if(!Ka){Ka=new WeakMap;for(var b=0;b<I.length;b++){var c=I.get(b);c&&Ka.set(c,b)}}if(Ka.has(a))a=Ka.get(a);else{if(Ja.length)b=Ja.pop();else{try{I.grow(1)}catch(g){if(!(g instanceof RangeError))throw g;throw"Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";}b=I.length-1}try{I.set(b,a)}catch(g){if(!(g instanceof TypeError))throw g;if("function"===typeof WebAssembly.Function){var d={i:"i32",j:"i64",f:"f32",d:"f64"},f={parameters:[],results:[]};for(c=1;4>c;++c)f.parameters.push(d["viii"[c]]);
c=new WebAssembly.Function(f,a)}else{d=[1,0,1,96];f={i:127,j:126,f:125,d:124};d.push(3);for(c=0;3>c;++c)d.push(f["iii"[c]]);d.push(0);d[1]=d.length-2;c=new Uint8Array([0,97,115,109,1,0,0,0].concat(d,[2,7,1,1,101,1,102,0,0,7,5,1,1,102,0,0]));c=new WebAssembly.Module(c);c=(new WebAssembly.Instance(c,{e:{f:a}})).exports.f}I.set(b,c)}Ka.set(a,b);a=b}return a}var La;e.wasmBinary&&(La=e.wasmBinary);var noExitRuntime=e.noExitRuntime||!0;"object"!==typeof WebAssembly&&J("no native wasm support detected");
function qa(a){var b="i32";"*"===b.charAt(b.length-1)&&(b="i32");switch(b){case "i1":y[a>>0]=0;break;case "i8":y[a>>0]=0;break;case "i16":Ma[a>>1]=0;break;case "i32":K[a>>2]=0;break;case "i64":L=[0,(O=0,1<=+Math.abs(O)?0<O?(Math.min(+Math.floor(O/4294967296),4294967295)|0)>>>0:~~+Math.ceil((O-+(~~O>>>0))/4294967296)>>>0:0)];K[a>>2]=L[0];K[a+4>>2]=L[1];break;case "float":Na[a>>2]=0;break;case "double":Oa[a>>3]=0;break;default:J("invalid type for setValue: "+b)}}
function v(a,b){b=b||"i8";"*"===b.charAt(b.length-1)&&(b="i32");switch(b){case "i1":return y[a>>0];case "i8":return y[a>>0];case "i16":return Ma[a>>1];case "i32":return K[a>>2];case "i64":return K[a>>2];case "float":return Na[a>>2];case "double":return Oa[a>>3];default:J("invalid type for getValue: "+b)}return null}var Pa,Qa=!1;function assert(a,b){a||J("Assertion failed: "+b)}function Ra(a){var b=e["_"+a];assert(b,"Cannot call unknown function "+a+", make sure it is exported");return b}
function Sa(a,b,c,d){var f={string:function(u){var C=0;if(null!==u&&void 0!==u&&0!==u){var H=(u.length<<2)+1;C=x(H);k(u,m,C,H)}return C},array:function(u){var C=x(u.length);y.set(u,C);return C}},g=Ra(a),n=[];a=0;if(d)for(var t=0;t<d.length;t++){var w=f[c[t]];w?(0===a&&(a=pa()),n[t]=w(d[t])):n[t]=d[t]}c=g.apply(null,n);c=function(u){return"string"===b?A(u):"boolean"===b?!!u:u}(c);0!==a&&ra(a);return c}var Ta=0,Ua=1;
function na(a){var b=Ta==Ua?x(a.length):da(a.length);a.subarray||a.slice?m.set(a,b):m.set(new Uint8Array(a),b);return b}var Va="undefined"!==typeof TextDecoder?new TextDecoder("utf8"):void 0;
function Wa(a,b,c){var d=b+c;for(c=b;a[c]&&!(c>=d);)++c;if(16<c-b&&a.subarray&&Va)return Va.decode(a.subarray(b,c));for(d="";b<c;){var f=a[b++];if(f&128){var g=a[b++]&63;if(192==(f&224))d+=String.fromCharCode((f&31)<<6|g);else{var n=a[b++]&63;f=224==(f&240)?(f&15)<<12|g<<6|n:(f&7)<<18|g<<12|n<<6|a[b++]&63;65536>f?d+=String.fromCharCode(f):(f-=65536,d+=String.fromCharCode(55296|f>>10,56320|f&1023))}}else d+=String.fromCharCode(f)}return d}function A(a,b){return a?Wa(m,a,b):""}
function k(a,b,c,d){if(!(0<d))return 0;var f=c;d=c+d-1;for(var g=0;g<a.length;++g){var n=a.charCodeAt(g);if(55296<=n&&57343>=n){var t=a.charCodeAt(++g);n=65536+((n&1023)<<10)|t&1023}if(127>=n){if(c>=d)break;b[c++]=n}else{if(2047>=n){if(c+1>=d)break;b[c++]=192|n>>6}else{if(65535>=n){if(c+2>=d)break;b[c++]=224|n>>12}else{if(c+3>=d)break;b[c++]=240|n>>18;b[c++]=128|n>>12&63}b[c++]=128|n>>6&63}b[c++]=128|n&63}}b[c]=0;return c-f}
function aa(a){for(var b=0,c=0;c<a.length;++c){var d=a.charCodeAt(c);55296<=d&&57343>=d&&(d=65536+((d&1023)<<10)|a.charCodeAt(++c)&1023);127>=d?++b:b=2047>=d?b+2:65535>=d?b+3:b+4}return b}function Xa(a){var b=aa(a)+1,c=da(b);c&&k(a,y,c,b);return c}var Ya,y,m,Ma,K,Na,Oa;
function Za(){var a=Pa.buffer;Ya=a;e.HEAP8=y=new Int8Array(a);e.HEAP16=Ma=new Int16Array(a);e.HEAP32=K=new Int32Array(a);e.HEAPU8=m=new Uint8Array(a);e.HEAPU16=new Uint16Array(a);e.HEAPU32=new Uint32Array(a);e.HEAPF32=Na=new Float32Array(a);e.HEAPF64=Oa=new Float64Array(a)}var I,$a=[],ab=[],bb=[],cb=[];ab.push({Ib:function(){db()}});function eb(){var a=e.preRun.shift();$a.unshift(a)}var fb=0,gb=null,hb=null;e.preloadedImages={};e.preloadedAudios={};
function J(a){if(e.onAbort)e.onAbort(a);F(a);Qa=!0;throw new WebAssembly.RuntimeError("abort("+a+"). Build with -s ASSERTIONS=1 for more info.");}function ib(a){var b=P;return String.prototype.startsWith?b.startsWith(a):0===b.indexOf(a)}function jb(){return ib("data:application/octet-stream;base64,")}var P="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.1/sql-wasm.wasm";if(!jb()){var kb=P;P=e.locateFile?e.locateFile(kb,E):E+kb}
function lb(){var a=P;try{if(a==P&&La)return new Uint8Array(La);if(Fa)return Fa(a);throw"both async and sync fetching of the wasm failed";}catch(b){J(b)}}
function mb(){if(!La&&(ya||za)){if("function"===typeof fetch&&!ib("file://"))return fetch(P,{credentials:"same-origin"}).then(function(a){if(!a.ok)throw"failed to load wasm binary file at '"+P+"'";return a.arrayBuffer()}).catch(function(){return lb()});if(Ea)return new Promise(function(a,b){Ea(P,function(c){a(new Uint8Array(c))},b)})}return Promise.resolve().then(function(){return lb()})}var O,L;
function nb(a){for(;0<a.length;){var b=a.shift();if("function"==typeof b)b(e);else{var c=b.Ib;"number"===typeof c?void 0===b.mb?I.get(c)():I.get(c)(b.mb):c(void 0===b.mb?null:b.mb)}}}function ob(a){return a.replace(/\b_Z[\w\d_]+/g,function(b){return b===b?b:b+" ["+b+"]"})}
function pb(){function a(n){return(n=n.toTimeString().match(/\(([A-Za-z ]+)\)$/))?n[1]:"GMT"}if(!qb){qb=!0;var b=(new Date).getFullYear(),c=new Date(b,0,1),d=new Date(b,6,1);b=c.getTimezoneOffset();var f=d.getTimezoneOffset(),g=Math.max(b,f);K[vb()>>2]=60*g;K[wb()>>2]=Number(b!=f);c=a(c);d=a(d);c=Xa(c);d=Xa(d);f<b?(K[yb()>>2]=c,K[yb()+4>>2]=d):(K[yb()>>2]=d,K[yb()+4>>2]=c)}}var qb;
function zb(a,b){for(var c=0,d=a.length-1;0<=d;d--){var f=a[d];"."===f?a.splice(d,1):".."===f?(a.splice(d,1),c++):c&&(a.splice(d,1),c--)}if(b)for(;c;c--)a.unshift("..");return a}function r(a){var b="/"===a.charAt(0),c="/"===a.substr(-1);(a=zb(a.split("/").filter(function(d){return!!d}),!b).join("/"))||b||(a=".");a&&c&&(a+="/");return(b?"/":"")+a}
function Ab(a){var b=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(a).slice(1);a=b[0];b=b[1];if(!a&&!b)return".";b&&(b=b.substr(0,b.length-1));return a+b}function Bb(a){if("/"===a)return"/";a=r(a);a=a.replace(/\/$/,"");var b=a.lastIndexOf("/");return-1===b?a:a.substr(b+1)}
function Cb(){if("object"===typeof crypto&&"function"===typeof crypto.getRandomValues){var a=new Uint8Array(1);return function(){crypto.getRandomValues(a);return a[0]}}if(Aa)try{var b=require("crypto");return function(){return b.randomBytes(1)[0]}}catch(c){}return function(){J("randomDevice")}}
function Db(){for(var a="",b=!1,c=arguments.length-1;-1<=c&&!b;c--){b=0<=c?arguments[c]:"/";if("string"!==typeof b)throw new TypeError("Arguments to path.resolve must be strings");if(!b)return"";a=b+"/"+a;b="/"===b.charAt(0)}a=zb(a.split("/").filter(function(d){return!!d}),!b).join("/");return(b?"/":"")+a||"."}var Eb=[];function Fb(a,b){Eb[a]={input:[],output:[],cb:b};Gb(a,Hb)}
var Hb={open:function(a){var b=Eb[a.node.rdev];if(!b)throw new Q(43);a.tty=b;a.seekable=!1},close:function(a){a.tty.cb.flush(a.tty)},flush:function(a){a.tty.cb.flush(a.tty)},read:function(a,b,c,d){if(!a.tty||!a.tty.cb.Ab)throw new Q(60);for(var f=0,g=0;g<d;g++){try{var n=a.tty.cb.Ab(a.tty)}catch(t){throw new Q(29);}if(void 0===n&&0===f)throw new Q(6);if(null===n||void 0===n)break;f++;b[c+g]=n}f&&(a.node.timestamp=Date.now());return f},write:function(a,b,c,d){if(!a.tty||!a.tty.cb.qb)throw new Q(60);
try{for(var f=0;f<d;f++)a.tty.cb.qb(a.tty,b[c+f])}catch(g){throw new Q(29);}d&&(a.node.timestamp=Date.now());return f}},Ib={Ab:function(a){if(!a.input.length){var b=null;if(Aa){var c=Buffer.Cb?Buffer.Cb(256):new Buffer(256),d=0;try{d=Ga.readSync(process.stdin.fd,c,0,256,null)}catch(f){if(-1!=f.toString().indexOf("EOF"))d=0;else throw f;}0<d?b=c.slice(0,d).toString("utf-8"):b=null}else"undefined"!=typeof window&&"function"==typeof window.prompt?(b=window.prompt("Input: "),null!==b&&(b+="\n")):"function"==
typeof readline&&(b=readline(),null!==b&&(b+="\n"));if(!b)return null;a.input=ma(b,!0)}return a.input.shift()},qb:function(a,b){null===b||10===b?(Ia(Wa(a.output,0)),a.output=[]):0!=b&&a.output.push(b)},flush:function(a){a.output&&0<a.output.length&&(Ia(Wa(a.output,0)),a.output=[])}},Jb={qb:function(a,b){null===b||10===b?(F(Wa(a.output,0)),a.output=[]):0!=b&&a.output.push(b)},flush:function(a){a.output&&0<a.output.length&&(F(Wa(a.output,0)),a.output=[])}},R={Va:null,Wa:function(){return R.createNode(null,
"/",16895,0)},createNode:function(a,b,c,d){if(24576===(c&61440)||4096===(c&61440))throw new Q(63);R.Va||(R.Va={dir:{node:{Ua:R.Ma.Ua,Ta:R.Ma.Ta,lookup:R.Ma.lookup,gb:R.Ma.gb,rename:R.Ma.rename,unlink:R.Ma.unlink,rmdir:R.Ma.rmdir,readdir:R.Ma.readdir,symlink:R.Ma.symlink},stream:{Za:R.Na.Za}},file:{node:{Ua:R.Ma.Ua,Ta:R.Ma.Ta},stream:{Za:R.Na.Za,read:R.Na.read,write:R.Na.write,sb:R.Na.sb,hb:R.Na.hb,ib:R.Na.ib}},link:{node:{Ua:R.Ma.Ua,Ta:R.Ma.Ta,readlink:R.Ma.readlink},stream:{}},wb:{node:{Ua:R.Ma.Ua,
Ta:R.Ma.Ta},stream:Kb}});c=Lb(a,b,c,d);S(c.mode)?(c.Ma=R.Va.dir.node,c.Na=R.Va.dir.stream,c.Oa={}):32768===(c.mode&61440)?(c.Ma=R.Va.file.node,c.Na=R.Va.file.stream,c.Sa=0,c.Oa=null):40960===(c.mode&61440)?(c.Ma=R.Va.link.node,c.Na=R.Va.link.stream):8192===(c.mode&61440)&&(c.Ma=R.Va.wb.node,c.Na=R.Va.wb.stream);c.timestamp=Date.now();a&&(a.Oa[b]=c,a.timestamp=c.timestamp);return c},Tb:function(a){return a.Oa?a.Oa.subarray?a.Oa.subarray(0,a.Sa):new Uint8Array(a.Oa):new Uint8Array(0)},xb:function(a,
b){var c=a.Oa?a.Oa.length:0;c>=b||(b=Math.max(b,c*(1048576>c?2:1.125)>>>0),0!=c&&(b=Math.max(b,256)),c=a.Oa,a.Oa=new Uint8Array(b),0<a.Sa&&a.Oa.set(c.subarray(0,a.Sa),0))},Qb:function(a,b){if(a.Sa!=b)if(0==b)a.Oa=null,a.Sa=0;else{var c=a.Oa;a.Oa=new Uint8Array(b);c&&a.Oa.set(c.subarray(0,Math.min(b,a.Sa)));a.Sa=b}},Ma:{Ua:function(a){var b={};b.dev=8192===(a.mode&61440)?a.id:1;b.ino=a.id;b.mode=a.mode;b.nlink=1;b.uid=0;b.gid=0;b.rdev=a.rdev;S(a.mode)?b.size=4096:32768===(a.mode&61440)?b.size=a.Sa:
40960===(a.mode&61440)?b.size=a.link.length:b.size=0;b.atime=new Date(a.timestamp);b.mtime=new Date(a.timestamp);b.ctime=new Date(a.timestamp);b.Hb=4096;b.blocks=Math.ceil(b.size/b.Hb);return b},Ta:function(a,b){void 0!==b.mode&&(a.mode=b.mode);void 0!==b.timestamp&&(a.timestamp=b.timestamp);void 0!==b.size&&R.Qb(a,b.size)},lookup:function(){throw Mb[44];},gb:function(a,b,c,d){return R.createNode(a,b,c,d)},rename:function(a,b,c){if(S(a.mode)){try{var d=Nb(b,c)}catch(g){}if(d)for(var f in d.Oa)throw new Q(55);
}delete a.parent.Oa[a.name];a.parent.timestamp=Date.now();a.name=c;b.Oa[c]=a;b.timestamp=a.parent.timestamp;a.parent=b},unlink:function(a,b){delete a.Oa[b];a.timestamp=Date.now()},rmdir:function(a,b){var c=Nb(a,b),d;for(d in c.Oa)throw new Q(55);delete a.Oa[b];a.timestamp=Date.now()},readdir:function(a){var b=[".",".."],c;for(c in a.Oa)a.Oa.hasOwnProperty(c)&&b.push(c);return b},symlink:function(a,b,c){a=R.createNode(a,b,41471,0);a.link=c;return a},readlink:function(a){if(40960!==(a.mode&61440))throw new Q(28);
return a.link}},Na:{read:function(a,b,c,d,f){var g=a.node.Oa;if(f>=a.node.Sa)return 0;a=Math.min(a.node.Sa-f,d);if(8<a&&g.subarray)b.set(g.subarray(f,f+a),c);else for(d=0;d<a;d++)b[c+d]=g[f+d];return a},write:function(a,b,c,d,f,g){b.buffer===y.buffer&&(g=!1);if(!d)return 0;a=a.node;a.timestamp=Date.now();if(b.subarray&&(!a.Oa||a.Oa.subarray)){if(g)return a.Oa=b.subarray(c,c+d),a.Sa=d;if(0===a.Sa&&0===f)return a.Oa=b.slice(c,c+d),a.Sa=d;if(f+d<=a.Sa)return a.Oa.set(b.subarray(c,c+d),f),d}R.xb(a,f+
d);if(a.Oa.subarray&&b.subarray)a.Oa.set(b.subarray(c,c+d),f);else for(g=0;g<d;g++)a.Oa[f+g]=b[c+g];a.Sa=Math.max(a.Sa,f+d);return d},Za:function(a,b,c){1===c?b+=a.position:2===c&&32768===(a.node.mode&61440)&&(b+=a.node.Sa);if(0>b)throw new Q(28);return b},sb:function(a,b,c){R.xb(a.node,b+c);a.node.Sa=Math.max(a.node.Sa,b+c)},hb:function(a,b,c,d,f,g){if(0!==b)throw new Q(28);if(32768!==(a.node.mode&61440))throw new Q(43);a=a.node.Oa;if(g&2||a.buffer!==Ya){if(0<d||d+c<a.length)a.subarray?a=a.subarray(d,
d+c):a=Array.prototype.slice.call(a,d,d+c);d=!0;g=16384*Math.ceil(c/16384);for(b=da(g);c<g;)y[b+c++]=0;c=b;if(!c)throw new Q(48);y.set(a,c)}else d=!1,c=a.byteOffset;return{Pb:c,kb:d}},ib:function(a,b,c,d,f){if(32768!==(a.node.mode&61440))throw new Q(43);if(f&2)return 0;R.Na.write(a,b,0,d,c,!1);return 0}}},Ob=null,Pb={},T=[],Qb=1,U=null,Rb=!0,V={},Q=null,Mb={};
function W(a,b){a=Db("/",a);b=b||{};if(!a)return{path:"",node:null};var c={yb:!0,rb:0},d;for(d in c)void 0===b[d]&&(b[d]=c[d]);if(8<b.rb)throw new Q(32);a=zb(a.split("/").filter(function(n){return!!n}),!1);var f=Ob;c="/";for(d=0;d<a.length;d++){var g=d===a.length-1;if(g&&b.parent)break;f=Nb(f,a[d]);c=r(c+"/"+a[d]);f.ab&&(!g||g&&b.yb)&&(f=f.ab.root);if(!g||b.Ya)for(g=0;40960===(f.mode&61440);)if(f=Sb(c),c=Db(Ab(c),f),f=W(c,{rb:b.rb}).node,40<g++)throw new Q(32);}return{path:c,node:f}}
function Tb(a){for(var b;;){if(a===a.parent)return a=a.Wa.Bb,b?"/"!==a[a.length-1]?a+"/"+b:a+b:a;b=b?a.name+"/"+b:a.name;a=a.parent}}function Ub(a,b){for(var c=0,d=0;d<b.length;d++)c=(c<<5)-c+b.charCodeAt(d)|0;return(a+c>>>0)%U.length}function Vb(a){var b=Ub(a.parent.id,a.name);if(U[b]===a)U[b]=a.bb;else for(b=U[b];b;){if(b.bb===a){b.bb=a.bb;break}b=b.bb}}
function Nb(a,b){var c;if(c=(c=Wb(a,"x"))?c:a.Ma.lookup?0:2)throw new Q(c,a);for(c=U[Ub(a.id,b)];c;c=c.bb){var d=c.name;if(c.parent.id===a.id&&d===b)return c}return a.Ma.lookup(a,b)}function Lb(a,b,c,d){a=new Xb(a,b,c,d);b=Ub(a.parent.id,a.name);a.bb=U[b];return U[b]=a}function S(a){return 16384===(a&61440)}var Yb={r:0,"r+":2,w:577,"w+":578,a:1089,"a+":1090};function Zb(a){var b=["r","w","rw"][a&3];a&512&&(b+="w");return b}
function Wb(a,b){if(Rb)return 0;if(-1===b.indexOf("r")||a.mode&292){if(-1!==b.indexOf("w")&&!(a.mode&146)||-1!==b.indexOf("x")&&!(a.mode&73))return 2}else return 2;return 0}function $b(a,b){try{return Nb(a,b),20}catch(c){}return Wb(a,"wx")}function ac(a,b,c){try{var d=Nb(a,b)}catch(f){return f.Pa}if(a=Wb(a,"wx"))return a;if(c){if(!S(d.mode))return 54;if(d===d.parent||"/"===Tb(d))return 10}else if(S(d.mode))return 31;return 0}
function bc(a){var b=4096;for(a=a||0;a<=b;a++)if(!T[a])return a;throw new Q(33);}function cc(a,b){dc||(dc=function(){},dc.prototype={});var c=new dc,d;for(d in a)c[d]=a[d];a=c;b=bc(b);a.fd=b;return T[b]=a}var Kb={open:function(a){a.Na=Pb[a.node.rdev].Na;a.Na.open&&a.Na.open(a)},Za:function(){throw new Q(70);}};function Gb(a,b){Pb[a]={Na:b}}
function ec(a,b){var c="/"===b,d=!b;if(c&&Ob)throw new Q(10);if(!c&&!d){var f=W(b,{yb:!1});b=f.path;f=f.node;if(f.ab)throw new Q(10);if(!S(f.mode))throw new Q(54);}b={type:a,Ub:{},Bb:b,Nb:[]};a=a.Wa(b);a.Wa=b;b.root=a;c?Ob=a:f&&(f.ab=b,f.Wa&&f.Wa.Nb.push(b))}function fa(a,b,c){var d=W(a,{parent:!0}).node;a=Bb(a);if(!a||"."===a||".."===a)throw new Q(28);var f=$b(d,a);if(f)throw new Q(f);if(!d.Ma.gb)throw new Q(63);return d.Ma.gb(d,a,b,c)}
function X(a,b){return fa(a,(void 0!==b?b:511)&1023|16384,0)}function fc(a,b,c){"undefined"===typeof c&&(c=b,b=438);fa(a,b|8192,c)}function hc(a,b){if(!Db(a))throw new Q(44);var c=W(b,{parent:!0}).node;if(!c)throw new Q(44);b=Bb(b);var d=$b(c,b);if(d)throw new Q(d);if(!c.Ma.symlink)throw new Q(63);c.Ma.symlink(c,b,a)}
function ua(a){var b=W(a,{parent:!0}).node,c=Bb(a),d=Nb(b,c),f=ac(b,c,!1);if(f)throw new Q(f);if(!b.Ma.unlink)throw new Q(63);if(d.ab)throw new Q(10);try{V.willDeletePath&&V.willDeletePath(a)}catch(g){F("FS.trackingDelegate['willDeletePath']('"+a+"') threw an exception: "+g.message)}b.Ma.unlink(b,c);Vb(d);try{if(V.onDeletePath)V.onDeletePath(a)}catch(g){F("FS.trackingDelegate['onDeletePath']('"+a+"') threw an exception: "+g.message)}}
function Sb(a){a=W(a).node;if(!a)throw new Q(44);if(!a.Ma.readlink)throw new Q(28);return Db(Tb(a.parent),a.Ma.readlink(a))}function ic(a,b){a=W(a,{Ya:!b}).node;if(!a)throw new Q(44);if(!a.Ma.Ua)throw new Q(63);return a.Ma.Ua(a)}function jc(a){return ic(a,!0)}function ha(a,b){var c;"string"===typeof a?c=W(a,{Ya:!0}).node:c=a;if(!c.Ma.Ta)throw new Q(63);c.Ma.Ta(c,{mode:b&4095|c.mode&-4096,timestamp:Date.now()})}
function kc(a){var b;"string"===typeof a?b=W(a,{Ya:!0}).node:b=a;if(!b.Ma.Ta)throw new Q(63);b.Ma.Ta(b,{timestamp:Date.now()})}function Mc(a,b){if(0>b)throw new Q(28);var c;"string"===typeof a?c=W(a,{Ya:!0}).node:c=a;if(!c.Ma.Ta)throw new Q(63);if(S(c.mode))throw new Q(31);if(32768!==(c.mode&61440))throw new Q(28);if(a=Wb(c,"w"))throw new Q(a);c.Ma.Ta(c,{size:b,timestamp:Date.now()})}
function ia(a,b,c,d){if(""===a)throw new Q(44);if("string"===typeof b){var f=Yb[b];if("undefined"===typeof f)throw Error("Unknown file open mode: "+b);b=f}c=b&64?("undefined"===typeof c?438:c)&4095|32768:0;if("object"===typeof a)var g=a;else{a=r(a);try{g=W(a,{Ya:!(b&131072)}).node}catch(n){}}f=!1;if(b&64)if(g){if(b&128)throw new Q(20);}else g=fa(a,c,0),f=!0;if(!g)throw new Q(44);8192===(g.mode&61440)&&(b&=-513);if(b&65536&&!S(g.mode))throw new Q(54);if(!f&&(c=g?40960===(g.mode&61440)?32:S(g.mode)&&
("r"!==Zb(b)||b&512)?31:Wb(g,Zb(b)):44))throw new Q(c);b&512&&Mc(g,0);b&=-131713;d=cc({node:g,path:Tb(g),flags:b,seekable:!0,position:0,Na:g.Na,Sb:[],error:!1},d);d.Na.open&&d.Na.open(d);!e.logReadFiles||b&1||(Nc||(Nc={}),a in Nc||(Nc[a]=1,F("FS.trackingDelegate error on read file: "+a)));try{V.onOpenFile&&(g=0,1!==(b&2097155)&&(g|=1),0!==(b&2097155)&&(g|=2),V.onOpenFile(a,g))}catch(n){F("FS.trackingDelegate['onOpenFile']('"+a+"', flags) threw an exception: "+n.message)}return d}
function la(a){if(null===a.fd)throw new Q(8);a.ob&&(a.ob=null);try{a.Na.close&&a.Na.close(a)}catch(b){throw b;}finally{T[a.fd]=null}a.fd=null}function Pc(a,b,c){if(null===a.fd)throw new Q(8);if(!a.seekable||!a.Na.Za)throw new Q(70);if(0!=c&&1!=c&&2!=c)throw new Q(28);a.position=a.Na.Za(a,b,c);a.Sb=[]}
function Qc(a,b,c,d,f){if(0>d||0>f)throw new Q(28);if(null===a.fd)throw new Q(8);if(1===(a.flags&2097155))throw new Q(8);if(S(a.node.mode))throw new Q(31);if(!a.Na.read)throw new Q(28);var g="undefined"!==typeof f;if(!g)f=a.position;else if(!a.seekable)throw new Q(70);b=a.Na.read(a,b,c,d,f);g||(a.position+=b);return b}
function ka(a,b,c,d,f,g){if(0>d||0>f)throw new Q(28);if(null===a.fd)throw new Q(8);if(0===(a.flags&2097155))throw new Q(8);if(S(a.node.mode))throw new Q(31);if(!a.Na.write)throw new Q(28);a.seekable&&a.flags&1024&&Pc(a,0,2);var n="undefined"!==typeof f;if(!n)f=a.position;else if(!a.seekable)throw new Q(70);b=a.Na.write(a,b,c,d,f,g);n||(a.position+=b);try{if(a.path&&V.onWriteToFile)V.onWriteToFile(a.path)}catch(t){F("FS.trackingDelegate['onWriteToFile']('"+a.path+"') threw an exception: "+t.message)}return b}
function ta(a){var b={encoding:"binary"};b=b||{};b.flags=b.flags||0;b.encoding=b.encoding||"binary";if("utf8"!==b.encoding&&"binary"!==b.encoding)throw Error('Invalid encoding type "'+b.encoding+'"');var c,d=ia(a,b.flags);a=ic(a).size;var f=new Uint8Array(a);Qc(d,f,0,a,0);"utf8"===b.encoding?c=Wa(f,0):"binary"===b.encoding&&(c=f);la(d);return c}
function Rc(){Q||(Q=function(a,b){this.node=b;this.Rb=function(c){this.Pa=c};this.Rb(a);this.message="FS error"},Q.prototype=Error(),Q.prototype.constructor=Q,[44].forEach(function(a){Mb[a]=new Q(a);Mb[a].stack="<generic error, no stack>"}))}var Sc;function ea(a,b){var c=0;a&&(c|=365);b&&(c|=146);return c}
function Tc(a,b,c){a=r("/dev/"+a);var d=ea(!!b,!!c);Uc||(Uc=64);var f=Uc++<<8|0;Gb(f,{open:function(g){g.seekable=!1},close:function(){c&&c.buffer&&c.buffer.length&&c(10)},read:function(g,n,t,w){for(var u=0,C=0;C<w;C++){try{var H=b()}catch(ba){throw new Q(29);}if(void 0===H&&0===u)throw new Q(6);if(null===H||void 0===H)break;u++;n[t+C]=H}u&&(g.node.timestamp=Date.now());return u},write:function(g,n,t,w){for(var u=0;u<w;u++)try{c(n[t+u])}catch(C){throw new Q(29);}w&&(g.node.timestamp=Date.now());return u}});
fc(a,d,f)}var Uc,Y={},dc,Nc,Vc={};
function Wc(a,b,c){try{var d=a(b)}catch(f){if(f&&f.node&&r(b)!==r(Tb(f.node)))return-54;throw f;}K[c>>2]=d.dev;K[c+4>>2]=0;K[c+8>>2]=d.ino;K[c+12>>2]=d.mode;K[c+16>>2]=d.nlink;K[c+20>>2]=d.uid;K[c+24>>2]=d.gid;K[c+28>>2]=d.rdev;K[c+32>>2]=0;L=[d.size>>>0,(O=d.size,1<=+Math.abs(O)?0<O?(Math.min(+Math.floor(O/4294967296),4294967295)|0)>>>0:~~+Math.ceil((O-+(~~O>>>0))/4294967296)>>>0:0)];K[c+40>>2]=L[0];K[c+44>>2]=L[1];K[c+48>>2]=4096;K[c+52>>2]=d.blocks;K[c+56>>2]=d.atime.getTime()/1E3|0;K[c+60>>2]=
0;K[c+64>>2]=d.mtime.getTime()/1E3|0;K[c+68>>2]=0;K[c+72>>2]=d.ctime.getTime()/1E3|0;K[c+76>>2]=0;L=[d.ino>>>0,(O=d.ino,1<=+Math.abs(O)?0<O?(Math.min(+Math.floor(O/4294967296),4294967295)|0)>>>0:~~+Math.ceil((O-+(~~O>>>0))/4294967296)>>>0:0)];K[c+80>>2]=L[0];K[c+84>>2]=L[1];return 0}var Xc=void 0;function Yc(){Xc+=4;return K[Xc-4>>2]}function Z(a){a=T[a];if(!a)throw new Q(8);return a}var Zc;
Aa?Zc=function(){var a=process.hrtime();return 1E3*a[0]+a[1]/1E6}:"undefined"!==typeof dateNow?Zc=dateNow:Zc=function(){return performance.now()};var $c={};function ad(){if(!bd){var a={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:("object"===typeof navigator&&navigator.languages&&navigator.languages[0]||"C").replace("-","_")+".UTF-8",_:xa||"./this.program"},b;for(b in $c)a[b]=$c[b];var c=[];for(b in a)c.push(b+"="+a[b]);bd=c}return bd}var bd;
function Xb(a,b,c,d){a||(a=this);this.parent=a;this.Wa=a.Wa;this.ab=null;this.id=Qb++;this.name=b;this.mode=c;this.Ma={};this.Na={};this.rdev=d}Object.defineProperties(Xb.prototype,{read:{get:function(){return 365===(this.mode&365)},set:function(a){a?this.mode|=365:this.mode&=-366}},write:{get:function(){return 146===(this.mode&146)},set:function(a){a?this.mode|=146:this.mode&=-147}}});Rc();U=Array(4096);ec(R,"/");X("/tmp");X("/home");X("/home/web_user");
(function(){X("/dev");Gb(259,{read:function(){return 0},write:function(b,c,d,f){return f}});fc("/dev/null",259);Fb(1280,Ib);Fb(1536,Jb);fc("/dev/tty",1280);fc("/dev/tty1",1536);var a=Cb();Tc("random",a);Tc("urandom",a);X("/dev/shm");X("/dev/shm/tmp")})();
(function(){X("/proc");var a=X("/proc/self");X("/proc/self/fd");ec({Wa:function(){var b=Lb(a,"fd",16895,73);b.Ma={lookup:function(c,d){var f=T[+d];if(!f)throw new Q(8);c={parent:null,Wa:{Bb:"fake"},Ma:{readlink:function(){return f.path}}};return c.parent=c}};return b}},"/proc/self/fd")})();function ma(a,b){var c=Array(aa(a)+1);a=k(a,c,0,c.length);b&&(c.length=a);return c}
var fd={a:function(a,b,c,d){J("Assertion failed: "+A(a)+", at: "+[b?A(b):"unknown filename",c,d?A(d):"unknown function"])},r:function(a,b){pb();a=new Date(1E3*K[a>>2]);K[b>>2]=a.getSeconds();K[b+4>>2]=a.getMinutes();K[b+8>>2]=a.getHours();K[b+12>>2]=a.getDate();K[b+16>>2]=a.getMonth();K[b+20>>2]=a.getFullYear()-1900;K[b+24>>2]=a.getDay();var c=new Date(a.getFullYear(),0,1);K[b+28>>2]=(a.getTime()-c.getTime())/864E5|0;K[b+36>>2]=-(60*a.getTimezoneOffset());var d=(new Date(a.getFullYear(),6,1)).getTimezoneOffset();
c=c.getTimezoneOffset();a=(d!=c&&a.getTimezoneOffset()==Math.min(c,d))|0;K[b+32>>2]=a;a=K[yb()+(a?4:0)>>2];K[b+40>>2]=a;return b},I:function(a,b){try{a=A(a);if(b&-8)var c=-28;else{var d;(d=W(a,{Ya:!0}).node)?(a="",b&4&&(a+="r"),b&2&&(a+="w"),b&1&&(a+="x"),c=a&&Wb(d,a)?-2:0):c=-44}return c}catch(f){return"undefined"!==typeof Y&&f instanceof Q||J(f),-f.Pa}},u:function(a,b){try{return a=A(a),ha(a,b),0}catch(c){return"undefined"!==typeof Y&&c instanceof Q||J(c),-c.Pa}},E:function(a){try{return a=A(a),
kc(a),0}catch(b){return"undefined"!==typeof Y&&b instanceof Q||J(b),-b.Pa}},v:function(a,b){try{var c=T[a];if(!c)throw new Q(8);ha(c.node,b);return 0}catch(d){return"undefined"!==typeof Y&&d instanceof Q||J(d),-d.Pa}},F:function(a){try{var b=T[a];if(!b)throw new Q(8);kc(b.node);return 0}catch(c){return"undefined"!==typeof Y&&c instanceof Q||J(c),-c.Pa}},b:function(a,b,c){Xc=c;try{var d=Z(a);switch(b){case 0:var f=Yc();return 0>f?-28:ia(d.path,d.flags,0,f).fd;case 1:case 2:return 0;case 3:return d.flags;
case 4:return f=Yc(),d.flags|=f,0;case 12:return f=Yc(),Ma[f+0>>1]=2,0;case 13:case 14:return 0;case 16:case 8:return-28;case 9:return K[cd()>>2]=28,-1;default:return-28}}catch(g){return"undefined"!==typeof Y&&g instanceof Q||J(g),-g.Pa}},w:function(a,b){try{var c=Z(a);return Wc(ic,c.path,b)}catch(d){return"undefined"!==typeof Y&&d instanceof Q||J(d),-d.Pa}},J:function(a,b,c){try{var d=T[a];if(!d)throw new Q(8);if(0===(d.flags&2097155))throw new Q(28);Mc(d.node,c);return 0}catch(f){return"undefined"!==
typeof Y&&f instanceof Q||J(f),-f.Pa}},x:function(a,b){try{if(0===b)return-28;if(b<aa("/")+1)return-68;k("/",m,a,b);return a}catch(c){return"undefined"!==typeof Y&&c instanceof Q||J(c),-c.Pa}},G:function(){return 0},d:function(){return 42},t:function(a,b){try{return a=A(a),Wc(jc,a,b)}catch(c){return"undefined"!==typeof Y&&c instanceof Q||J(c),-c.Pa}},s:function(a,b){try{return a=A(a),a=r(a),"/"===a[a.length-1]&&(a=a.substr(0,a.length-1)),X(a,b),0}catch(c){return"undefined"!==typeof Y&&c instanceof
Q||J(c),-c.Pa}},i:function(a,b,c,d,f,g){try{a:{g<<=12;var n=!1;if(0!==(d&16)&&0!==a%16384)var t=-28;else{if(0!==(d&32)){var w=dd(16384,b);if(!w){t=-48;break a}ed(w,0,b);n=!0}else{var u=T[f];if(!u){t=-8;break a}var C=g;if(0!==(c&2)&&0===(d&2)&&2!==(u.flags&2097155))throw new Q(2);if(1===(u.flags&2097155))throw new Q(2);if(!u.Na.hb)throw new Q(43);var H=u.Na.hb(u,a,b,C,c,d);w=H.Pb;n=H.kb}Vc[w]={Mb:w,Lb:b,kb:n,fd:f,Ob:c,flags:d,offset:g};t=w}}return t}catch(ba){return"undefined"!==typeof Y&&ba instanceof
Q||J(ba),-ba.Pa}},j:function(a,b){try{if(-1===(a|0)||0===b)var c=-28;else{var d=Vc[a];if(d&&b===d.Lb){var f=T[d.fd];if(f&&d.Ob&2){var g=d.flags,n=d.offset,t=m.slice(a,a+b);f&&f.Na.ib&&f.Na.ib(f,t,n,b,g)}Vc[a]=null;d.kb&&oa(d.Mb)}c=0}return c}catch(w){return"undefined"!==typeof Y&&w instanceof Q||J(w),-w.Pa}},h:function(a,b,c){Xc=c;try{var d=A(a),f=c?Yc():0;return ia(d,b,f).fd}catch(g){return"undefined"!==typeof Y&&g instanceof Q||J(g),-g.Pa}},D:function(a,b,c){try{a=A(a);if(0>=c)var d=-28;else{var f=
Sb(a),g=Math.min(c,aa(f)),n=y[b+g];k(f,m,b,c+1);y[b+g]=n;d=g}return d}catch(t){return"undefined"!==typeof Y&&t instanceof Q||J(t),-t.Pa}},B:function(a){try{a=A(a);var b=W(a,{parent:!0}).node,c=Bb(a),d=Nb(b,c),f=ac(b,c,!0);if(f)throw new Q(f);if(!b.Ma.rmdir)throw new Q(63);if(d.ab)throw new Q(10);try{V.willDeletePath&&V.willDeletePath(a)}catch(g){F("FS.trackingDelegate['willDeletePath']('"+a+"') threw an exception: "+g.message)}b.Ma.rmdir(b,c);Vb(d);try{if(V.onDeletePath)V.onDeletePath(a)}catch(g){F("FS.trackingDelegate['onDeletePath']('"+
a+"') threw an exception: "+g.message)}return 0}catch(g){return"undefined"!==typeof Y&&g instanceof Q||J(g),-g.Pa}},f:function(a,b){try{return a=A(a),Wc(ic,a,b)}catch(c){return"undefined"!==typeof Y&&c instanceof Q||J(c),-c.Pa}},y:function(a){try{return a=A(a),ua(a),0}catch(b){return"undefined"!==typeof Y&&b instanceof Q||J(b),-b.Pa}},l:function(a,b,c){m.copyWithin(a,b,b+c)},c:function(a){var b=m.length;if(2147483648<a)return!1;for(var c=1;4>=c;c*=2){var d=b*(1+.2/c);d=Math.min(d,a+100663296);d=Math.max(a,
d);0<d%65536&&(d+=65536-d%65536);a:{try{Pa.grow(Math.min(2147483648,d)-Ya.byteLength+65535>>>16);Za();var f=1;break a}catch(g){}f=void 0}if(f)return!0}return!1},p:function(a){for(var b=Zc();Zc()-b<a;);},n:function(a,b){try{var c=0;ad().forEach(function(d,f){var g=b+c;f=K[a+4*f>>2]=g;for(g=0;g<d.length;++g)y[f++>>0]=d.charCodeAt(g);y[f>>0]=0;c+=d.length+1});return 0}catch(d){return"undefined"!==typeof Y&&d instanceof Q||J(d),d.Pa}},o:function(a,b){try{var c=ad();K[a>>2]=c.length;var d=0;c.forEach(function(f){d+=
f.length+1});K[b>>2]=d;return 0}catch(f){return"undefined"!==typeof Y&&f instanceof Q||J(f),f.Pa}},e:function(a){try{var b=Z(a);la(b);return 0}catch(c){return"undefined"!==typeof Y&&c instanceof Q||J(c),c.Pa}},m:function(a,b){try{var c=Z(a);y[b>>0]=c.tty?2:S(c.mode)?3:40960===(c.mode&61440)?7:4;return 0}catch(d){return"undefined"!==typeof Y&&d instanceof Q||J(d),d.Pa}},z:function(a,b,c,d){try{a:{for(var f=Z(a),g=a=0;g<c;g++){var n=K[b+(8*g+4)>>2],t=Qc(f,y,K[b+8*g>>2],n,void 0);if(0>t){var w=-1;break a}a+=
t;if(t<n)break}w=a}K[d>>2]=w;return 0}catch(u){return"undefined"!==typeof Y&&u instanceof Q||J(u),u.Pa}},k:function(a,b,c,d,f){try{var g=Z(a);a=4294967296*c+(b>>>0);if(-9007199254740992>=a||9007199254740992<=a)return-61;Pc(g,a,d);L=[g.position>>>0,(O=g.position,1<=+Math.abs(O)?0<O?(Math.min(+Math.floor(O/4294967296),4294967295)|0)>>>0:~~+Math.ceil((O-+(~~O>>>0))/4294967296)>>>0:0)];K[f>>2]=L[0];K[f+4>>2]=L[1];g.ob&&0===a&&0===d&&(g.ob=null);return 0}catch(n){return"undefined"!==typeof Y&&n instanceof
Q||J(n),n.Pa}},H:function(a){try{var b=Z(a);return b.Na&&b.Na.fsync?-b.Na.fsync(b):0}catch(c){return"undefined"!==typeof Y&&c instanceof Q||J(c),c.Pa}},C:function(a,b,c,d){try{a:{for(var f=Z(a),g=a=0;g<c;g++){var n=ka(f,y,K[b+8*g>>2],K[b+(8*g+4)>>2],void 0);if(0>n){var t=-1;break a}a+=n}t=a}K[d>>2]=t;return 0}catch(w){return"undefined"!==typeof Y&&w instanceof Q||J(w),w.Pa}},g:function(a){var b=Date.now();K[a>>2]=b/1E3|0;K[a+4>>2]=b%1E3*1E3|0;return 0},A:function(a){switch(a){case 30:return 16384;
case 85:return 131072;case 132:case 133:case 12:case 137:case 138:case 15:case 235:case 16:case 17:case 18:case 19:case 20:case 149:case 13:case 10:case 236:case 153:case 9:case 21:case 22:case 159:case 154:case 14:case 77:case 78:case 139:case 82:case 68:case 67:case 164:case 11:case 29:case 47:case 48:case 95:case 52:case 51:case 46:return 200809;case 27:case 246:case 127:case 128:case 23:case 24:case 160:case 161:case 181:case 182:case 242:case 183:case 184:case 243:case 244:case 245:case 165:case 178:case 179:case 49:case 50:case 168:case 169:case 175:case 170:case 171:case 172:case 97:case 76:case 32:case 173:case 35:case 80:case 81:case 79:return-1;
case 176:case 177:case 7:case 155:case 8:case 157:case 125:case 126:case 92:case 93:case 129:case 130:case 131:case 94:case 91:return 1;case 74:case 60:case 69:case 70:case 4:return 1024;case 31:case 42:case 72:return 32;case 87:case 26:case 33:return 2147483647;case 34:case 1:return 47839;case 38:case 36:return 99;case 43:case 37:return 2048;case 0:return 2097152;case 3:return 65536;case 28:return 32768;case 44:return 32767;case 75:return 16384;case 39:return 1E3;case 89:return 700;case 71:return 256;
case 40:return 255;case 2:return 100;case 180:return 64;case 25:return 20;case 5:return 16;case 6:return 6;case 73:return 4;case 84:return"object"===typeof navigator?navigator.hardwareConcurrency||1:1}K[cd()>>2]=28;return-1},K:function(a){var b=Date.now()/1E3|0;a&&(K[a>>2]=b);return b},q:function(a,b){if(b){var c=b+8;b=1E3*K[c>>2];b+=K[c+4>>2]/1E3}else b=Date.now();a=A(a);try{var d=W(a,{Ya:!0}).node;d.Ma.Ta(d,{timestamp:Math.max(b,b)});var f=0}catch(g){if(!(g instanceof Q)){b:{f=Error();if(!f.stack){try{throw Error();
}catch(n){f=n}if(!f.stack){f="(no stack trace available)";break b}}f=f.stack.toString()}e.extraStackTrace&&(f+="\n"+e.extraStackTrace());f=ob(f);throw g+" : "+f;}f=g.Pa;K[cd()>>2]=f;f=-1}return f}};
(function(){function a(f){e.asm=f.exports;Pa=e.asm.L;Za();I=e.asm.Da;fb--;e.monitorRunDependencies&&e.monitorRunDependencies(fb);0==fb&&(null!==gb&&(clearInterval(gb),gb=null),hb&&(f=hb,hb=null,f()))}function b(f){a(f.instance)}function c(f){return mb().then(function(g){return WebAssembly.instantiate(g,d)}).then(f,function(g){F("failed to asynchronously prepare wasm: "+g);J(g)})}var d={a:fd};fb++;e.monitorRunDependencies&&e.monitorRunDependencies(fb);if(e.instantiateWasm)try{return e.instantiateWasm(d,
a)}catch(f){return F("Module.instantiateWasm callback failed with error: "+f),!1}(function(){return La||"function"!==typeof WebAssembly.instantiateStreaming||jb()||ib("file://")||"function"!==typeof fetch?c(b):fetch(P,{credentials:"same-origin"}).then(function(f){return WebAssembly.instantiateStreaming(f,d).then(b,function(g){F("wasm streaming compile failed: "+g);F("falling back to ArrayBuffer instantiation");return c(b)})})})();return{}})();
var db=e.___wasm_call_ctors=function(){return(db=e.___wasm_call_ctors=e.asm.M).apply(null,arguments)},ed=e._memset=function(){return(ed=e._memset=e.asm.N).apply(null,arguments)};e._sqlite3_free=function(){return(e._sqlite3_free=e.asm.O).apply(null,arguments)};var cd=e.___errno_location=function(){return(cd=e.___errno_location=e.asm.P).apply(null,arguments)};e._sqlite3_finalize=function(){return(e._sqlite3_finalize=e.asm.Q).apply(null,arguments)};
e._sqlite3_reset=function(){return(e._sqlite3_reset=e.asm.R).apply(null,arguments)};e._sqlite3_clear_bindings=function(){return(e._sqlite3_clear_bindings=e.asm.S).apply(null,arguments)};e._sqlite3_value_blob=function(){return(e._sqlite3_value_blob=e.asm.T).apply(null,arguments)};e._sqlite3_value_text=function(){return(e._sqlite3_value_text=e.asm.U).apply(null,arguments)};e._sqlite3_value_bytes=function(){return(e._sqlite3_value_bytes=e.asm.V).apply(null,arguments)};
e._sqlite3_value_double=function(){return(e._sqlite3_value_double=e.asm.W).apply(null,arguments)};e._sqlite3_value_int=function(){return(e._sqlite3_value_int=e.asm.X).apply(null,arguments)};e._sqlite3_value_type=function(){return(e._sqlite3_value_type=e.asm.Y).apply(null,arguments)};e._sqlite3_result_blob=function(){return(e._sqlite3_result_blob=e.asm.Z).apply(null,arguments)};e._sqlite3_result_double=function(){return(e._sqlite3_result_double=e.asm._).apply(null,arguments)};
e._sqlite3_result_error=function(){return(e._sqlite3_result_error=e.asm.$).apply(null,arguments)};e._sqlite3_result_int=function(){return(e._sqlite3_result_int=e.asm.aa).apply(null,arguments)};e._sqlite3_result_int64=function(){return(e._sqlite3_result_int64=e.asm.ba).apply(null,arguments)};e._sqlite3_result_null=function(){return(e._sqlite3_result_null=e.asm.ca).apply(null,arguments)};e._sqlite3_result_text=function(){return(e._sqlite3_result_text=e.asm.da).apply(null,arguments)};
e._sqlite3_step=function(){return(e._sqlite3_step=e.asm.ea).apply(null,arguments)};e._sqlite3_column_count=function(){return(e._sqlite3_column_count=e.asm.fa).apply(null,arguments)};e._sqlite3_data_count=function(){return(e._sqlite3_data_count=e.asm.ga).apply(null,arguments)};e._sqlite3_column_blob=function(){return(e._sqlite3_column_blob=e.asm.ha).apply(null,arguments)};e._sqlite3_column_bytes=function(){return(e._sqlite3_column_bytes=e.asm.ia).apply(null,arguments)};
e._sqlite3_column_double=function(){return(e._sqlite3_column_double=e.asm.ja).apply(null,arguments)};e._sqlite3_column_text=function(){return(e._sqlite3_column_text=e.asm.ka).apply(null,arguments)};e._sqlite3_column_type=function(){return(e._sqlite3_column_type=e.asm.la).apply(null,arguments)};e._sqlite3_column_name=function(){return(e._sqlite3_column_name=e.asm.ma).apply(null,arguments)};e._sqlite3_bind_blob=function(){return(e._sqlite3_bind_blob=e.asm.na).apply(null,arguments)};
e._sqlite3_bind_double=function(){return(e._sqlite3_bind_double=e.asm.oa).apply(null,arguments)};e._sqlite3_bind_int=function(){return(e._sqlite3_bind_int=e.asm.pa).apply(null,arguments)};e._sqlite3_bind_text=function(){return(e._sqlite3_bind_text=e.asm.qa).apply(null,arguments)};e._sqlite3_bind_parameter_index=function(){return(e._sqlite3_bind_parameter_index=e.asm.ra).apply(null,arguments)};e._sqlite3_sql=function(){return(e._sqlite3_sql=e.asm.sa).apply(null,arguments)};
e._sqlite3_normalized_sql=function(){return(e._sqlite3_normalized_sql=e.asm.ta).apply(null,arguments)};e._sqlite3_errmsg=function(){return(e._sqlite3_errmsg=e.asm.ua).apply(null,arguments)};e._sqlite3_exec=function(){return(e._sqlite3_exec=e.asm.va).apply(null,arguments)};e._sqlite3_prepare_v2=function(){return(e._sqlite3_prepare_v2=e.asm.wa).apply(null,arguments)};e._sqlite3_changes=function(){return(e._sqlite3_changes=e.asm.xa).apply(null,arguments)};
e._sqlite3_close_v2=function(){return(e._sqlite3_close_v2=e.asm.ya).apply(null,arguments)};e._sqlite3_create_function_v2=function(){return(e._sqlite3_create_function_v2=e.asm.za).apply(null,arguments)};e._sqlite3_open=function(){return(e._sqlite3_open=e.asm.Aa).apply(null,arguments)};var da=e._malloc=function(){return(da=e._malloc=e.asm.Ba).apply(null,arguments)},oa=e._free=function(){return(oa=e._free=e.asm.Ca).apply(null,arguments)};
e._RegisterExtensionFunctions=function(){return(e._RegisterExtensionFunctions=e.asm.Ea).apply(null,arguments)};
var yb=e.__get_tzname=function(){return(yb=e.__get_tzname=e.asm.Fa).apply(null,arguments)},wb=e.__get_daylight=function(){return(wb=e.__get_daylight=e.asm.Ga).apply(null,arguments)},vb=e.__get_timezone=function(){return(vb=e.__get_timezone=e.asm.Ha).apply(null,arguments)},pa=e.stackSave=function(){return(pa=e.stackSave=e.asm.Ia).apply(null,arguments)},ra=e.stackRestore=function(){return(ra=e.stackRestore=e.asm.Ja).apply(null,arguments)},x=e.stackAlloc=function(){return(x=e.stackAlloc=e.asm.Ka).apply(null,
arguments)},dd=e._memalign=function(){return(dd=e._memalign=e.asm.La).apply(null,arguments)};e.cwrap=function(a,b,c,d){c=c||[];var f=c.every(function(g){return"number"===g});return"string"!==b&&f&&!d?Ra(a):function(){return Sa(a,b,c,arguments)}};e.UTF8ToString=A;e.stackSave=pa;e.stackRestore=ra;e.stackAlloc=x;var gd;hb=function hd(){gd||id();gd||(hb=hd)};
function id(){function a(){if(!gd&&(gd=!0,e.calledRun=!0,!Qa)){e.noFSInit||Sc||(Sc=!0,Rc(),e.stdin=e.stdin,e.stdout=e.stdout,e.stderr=e.stderr,e.stdin?Tc("stdin",e.stdin):hc("/dev/tty","/dev/stdin"),e.stdout?Tc("stdout",null,e.stdout):hc("/dev/tty","/dev/stdout"),e.stderr?Tc("stderr",null,e.stderr):hc("/dev/tty1","/dev/stderr"),ia("/dev/stdin",0),ia("/dev/stdout",1),ia("/dev/stderr",1));nb(ab);Rb=!1;nb(bb);if(e.onRuntimeInitialized)e.onRuntimeInitialized();if(e.postRun)for("function"==typeof e.postRun&&
(e.postRun=[e.postRun]);e.postRun.length;){var b=e.postRun.shift();cb.unshift(b)}nb(cb)}}if(!(0<fb)){if(e.preRun)for("function"==typeof e.preRun&&(e.preRun=[e.preRun]);e.preRun.length;)eb();nb($a);0<fb||(e.setStatus?(e.setStatus("Running..."),setTimeout(function(){setTimeout(function(){e.setStatus("")},1);a()},1)):a())}}e.run=id;if(e.preInit)for("function"==typeof e.preInit&&(e.preInit=[e.preInit]);0<e.preInit.length;)e.preInit.pop()();id();


        // The shell-pre.js and emcc-generated code goes above
        return Module;
    }); // The end of the promise being returned

  return initSqlJsPromise;
} // The end of our initSqlJs function

// This bit below is copied almost exactly from what you get when you use the MODULARIZE=1 flag with emcc
// However, we don't want to use the emcc modularization. See shell-pre.js
if (typeof exports === 'object' && typeof module === 'object'){
    module.exports = initSqlJs;
    // This will allow the module to be used in ES6 or CommonJS
    module.exports.default = initSqlJs;
}
else if (typeof define === 'function' && define['amd']) {
    define([], function() { return initSqlJs; });
}
else if (typeof exports === 'object'){
    exports["Module"] = initSqlJs;
}
/* global initSqlJs */
/* eslint-env worker */
/* eslint no-restricted-globals: ["error"] */

"use strict";

var db;

function onModuleReady(SQL) {
    function createDb(data) {
        if (db != null) db.close();
        db = new SQL.Database(data);
        return db;
    }

    var buff; var data; var result;
    data = this["data"];
    var config = data["config"] ? data["config"] : {};
    switch (data && data["action"]) {
        case "open":
            buff = data["buffer"];
            createDb(buff && new Uint8Array(buff));
            return postMessage({
                id: data["id"],
                ready: true
            });
        case "exec":
            if (db === null) {
                createDb();
            }
            if (!data["sql"]) {
                throw "exec: Missing query string";
            }
            return postMessage({
                id: data["id"],
                results: db.exec(data["sql"], data["params"], config)
            });
        case "each":
            if (db === null) {
                createDb();
            }
            var callback = function callback(row) {
                return postMessage({
                    id: data["id"],
                    row: row,
                    finished: false
                });
            };
            var done = function done() {
                return postMessage({
                    id: data["id"],
                    finished: true
                });
            };
            return db.each(data["sql"], data["params"], callback, done, config);
        case "export":
            buff = db["export"]();
            result = {
                id: data["id"],
                buffer: buff
            };
            try {
                return postMessage(result, [result]);
            } catch (error) {
                return postMessage(result);
            }
        case "close":
            if (db) {
                db.close();
            }
            return postMessage({
                id: data["id"]
            });
        default:
            throw new Error("Invalid action : " + (data && data["action"]));
    }
}

function onError(err) {
    return postMessage({
        id: this["data"]["id"],
        error: err["message"]
    });
}

if (typeof importScripts === "function") {
    console.log('importScripts is a function!');
    db = null;
    var sqlModuleReady = initSqlJs();
    console.log('initSqlJs finished: ', sqlModuleReady);
    self.onmessage = function onmessage(event) {
        return sqlModuleReady
            .then(console.log('hello'))
            .then(console.log('promise resolved?: ', sqlModuleReady))
            .then(onModuleReady.bind(event))
            .catch(onError.bind(event));
    };
}
