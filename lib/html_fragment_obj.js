// Copyright 
// Mail: 

"use strict;";

var boj = boj || {};

boj.html_fragment = ( function () {

    function Html_frag(){ // constructor
        this.doc = document;
        this.frag = this.doc.createDocumentFragment();
        this.cnode = this.frag;
    }

    Html_frag.prototype.add_top_tag =
        function ( tag ){
            var node = this.doc.createElement( tag );
            this.frag.appendChild( node );
            return this.cnode = node;
        };

    Html_frag.prototype.add_top_txt =
        function ( txt ){
            var node = this.doc.createTextNode( txt );
            this.frag.appendChild( node );
            this.cnode = this.frag;
            return node;
        };

    Html_frag.prototype.add_tag =
        function ( tag ){
            var node = this.doc.createElement( tag );
            this.cnode.appendChild( node );
            return this.cnode = node;
        };
    
    Html_frag.prototype.add_txt =
        function ( txt ){
            var node = this.doc.createTextNode( txt );
            this.cnode.appendChild( node );
            return node;
        };
    
    Html_frag.prototype.current_node =
        function ( node ){
            if ( arguments.length ){
                this.cnode = node;
            }
            return this.cnode;
        };

    Html_frag.prototype.set_att =
        function ( name, value ){
            this.cnode.setAttribute( name, value );
        };

    Html_frag.prototype.add_to_target =
        function ( target, append ){
            if ( ! append ){
                while( target.hasChildNodes() ){
                    target.removeChild(target.firstChild);
                }
            }
            target.appendChild( this.frag );
        };

    function new_html_fragment(){
        return new Html_frag();
    }

    var self = {
        new_html_fragment : new_html_fragment
    };

    return self;
})();
