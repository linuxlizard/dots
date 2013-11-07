"vimrc
syntax on
set viminfo='20,"50
set cindent
set sts=4
set shiftwidth=4
set et
set cin
set vb t_vb=
set ruler
set showmatch
"set tw=0
set tw=79
set ai
set is

map <C-i> 0i#<Esc>0j
map <C-P> 0i//<Esc>0j
map <C-O> xj

"au BufRead /tmp/mutt* normal :g/^> -- $/,/^$/-1d^M/^$^M^L
hi search ctermfg=red ctermbg=green cterm=none

set hlsearch

au BufReadPost * if line("'\"") > 0 && line("'\"") <= line("$") | exe "normal g'\"z." | endif

" 19-Nov-04 ; automatically insert comment leaders
set formatoptions+=ro

" 24-dec-04
"set tags+=/Users/davep/src/openssl-0.9.7e/tags
" 26-dec-04
"set tags+=/Users/davep/src/net-snmp-5.3.1/tags

au BufNewFile,BufRead *.py set nocindent
au BufNewFile,BufRead *.py set nosmartindent
au BufNewFile,BufRead *.py set autoindent

" 13-Jan-2007 ; working over ssh on terminal that doesn't do color
"syntax off

" 5-Aug-05 ; insert Doxygen header with today's date
"
"   /**
"    * \brief  
"    *
"    *
"    * \author David Poole
"    * \date 05-Aug-2005
"    *
"    */
"
function! Davehdr()
    let s:today = strftime( "%d-%b-%Y" )
    execute "normal o/**\n\<Esc>"
    execute "normal a \\brief  \n\n\\author David Poole\n\<Esc>"
    execute "normal a \\date " . s:today . "\n\<Esc>"
    execute "normal a/\n\<Esc>"
    execute "normal 7kA"
endfunction

" add my usual "davep date" stamp on cheap hack code
" /* davep 05-Aug-2005 ;  */
function! Davestamp()
    let s:today = strftime( "%d-%b-%Y" )
    if &filetype =~ "python" 
        execute "normal O# davep " . s:today . " ;  \<Esc>"
    else 
        execute "normal O/* davep " . s:today . " ;  */\<Esc>hh"
    endif
endfunction

function! DavestampHash()
    let s:today = strftime( "%d-%b-%Y" )
    execute "normal O# davep " . s:today . " ;  \<Esc>"
endfunction

function! DaveDebug()
    execute "normal Odbg2( \"%s %d\\n\", __FUNCTION__, __LINE__ );"
endfunction

map <C-h> :call Davehdr()<CR>
map <C-d> :call Davestamp()<CR>
map <C-l> :call DaveDebug()<CR>

" 25-July-2007
"set tags+=/Users/davep/src/whitehawk-release/firmware/tags

" 27-Aug-2007
"set tags+=/Users/davep/src/jbigkit/tags

" 16-Feb-2010 ; change comment color so black background not so harsh
highlight Comment ctermfg=lightblue

" 10-Mar-2010 ; I fucking hate fucking unity shit shit fuck
"set tags+=~/src/gemstone/tags

"autocmd BufEnter * :syntax sync fromstart

" 08-Jun-2011 ; add taglist (Thanks to Bryan Allen)
nnoremap <silent> <F5> :TlistToggle<CR>

" 24-Aug-2012 ; too useful to lose; multi-line regex to fix dbg1(( ));
" see also: http://vim.wikia.com/wiki/Search_across_multiple_lines
" :s/dbg\([12]\)((\(\_.\{-}\)));/dbg\1(\2);

