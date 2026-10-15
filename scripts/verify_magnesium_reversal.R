library(metadat)
library(metafor)
d <- metadat::dat.egger2001
s <- subset(d, id %in% c(1,2,3,6,14,16))
stopifnot(nrow(s)==6L)
f <- function(x) exp(as.numeric(coef(rma.peto(ai=ai,n1i=n1i,ci=ci,n2i=n2i,data=x))))
stopifnot(abs(f(subset(s,id!=16))-0.622306)<1e-5, abs(f(s)-1.027995)<1e-5)
cat('PASS: 5 and 6 trial teaching subsets reproduce Peto OR values.\n')
