# .bashrc

# Source global definitions
if [ -f /etc/bashrc ]; then
	. /etc/bashrc
fi

# User specific aliases and functions
export PS1='...\h:\W% '

export HISTCONTROL=ignoredups:erasedups

PATH=$HOME/bin:$PATH
PATH=$PATH:/opt/armgcc/bin
export PATH

alias ls='ls -F'
alias ll='ls -AlF'
alias h='history|tail'
alias psme='ps waux | grep davep'
alias lsd='ls -d */'
alias findc="find . -name '*.c'"
alias findh="find . -name '*.h'"

function lk () { ls -lrt $@ | tail; }

# for Perforce
export P4PORT=10.71.120.88:1666
#export P4PORT=prp4.marvell.com:1666
export P4USER=dpoole
export P4CLIENT=davep_latches_jssl
export P4EDITOR=vim
alias pout="p4 opened"
alias pdiff="p4 diff -dubwl"
alias ppend="p4 changes -u dpoole -s pending"

alias smbc='smbclient -A ~/.auth'

alias sizeof='stat -c '\''%s'\'''

function upfoo () 
{ 
    export FOO=$(( ${FOO} + 1 ))
}

# stfu
export LESS=-q
export LESSHISTFILE=/dev/null

# stfu, part 2
unset PROMPT_COMMAND

# scan code shortcuts
function src() 
{ 
    cd ~/src/jssl/common/scan/src/ 
}

