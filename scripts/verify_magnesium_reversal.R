# Reproduce archival selected-subset and full-dataset Peto equal-effects ORs.
# Requires installed R packages: metadat and metafor. Not a clinical recommendation.
library(metadat)
library(metafor)
d <- metadat::dat.egger2001
stopifnot(nrow(d) == 16L, identical(as.integer(d$id), 1:16))
s <- subset(d, id %in% c(1,2,3,6,14,16))
stopifnot(nrow(s)==6L,
          identical(as.integer(s$id), c(1L,2L,3L,6L,14L,16L)),
          identical(as.integer(s$ai),c(1L,9L,2L,1L,90L,2216L)),
          identical(as.integer(s$ci),c(2L,23L,7L,9L,118L,2103L)))
fit <- function(x) {
  m <- metafor::rma.peto(ai=ai,n1i=n1i,ci=ci,n2i=n2i,data=x)
  c(OR=exp(as.numeric(coef(m))),lower=exp(m$ci.lb),upper=exp(m$ci.ub))
}
near <- function(x,y,tol) all(is.finite(x) & abs(x-y)<tol)
a <- fit(subset(s,id!=16)); b <- fit(s)
stopifnot(near(a,c(0.6223062354,0.4828407689,0.8020554095),1e-5),
          near(b,c(1.0279954951,0.9679113631,1.0918094139),1e-5))
full15 <- fit(subset(d,id!=16)); full16 <- fit(d)
# Full-dataset comparators are rounded as printed on the official metadat reference page.
stopifnot(near(full15,c(0.55,0.44,0.68),0.011),
          near(full16,c(1.01,0.95,1.07),0.011))
print(rbind(classroom_five=a,classroom_six=b,reference_fifteen=full15,reference_sixteen=full16))
cat('PASS: selected 5/6-trial and full 15/16-trial reference Peto comparisons.\n')
