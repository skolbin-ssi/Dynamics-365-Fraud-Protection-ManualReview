package com.griddynamics.msd365fp.manualreview.cosmos.utilities;

import com.griddynamics.msd365fp.manualreview.model.PageableCollection;
import com.griddynamics.msd365fp.manualreview.model.exception.BusyException;
import lombok.experimental.UtilityClass;

import java.util.Collection;
import java.util.LinkedList;
import java.util.function.Consumer;

import static com.griddynamics.msd365fp.manualreview.cosmos.utilities.Constants.NUMBER_OF_ATTEMPTS_TO_GET_NOT_EMPTY_PAGE;

@UtilityClass
public class PageProcessingUtility {

    private final String STORAGE_IS_OVERLOADED = "Storage is overloaded";

    public <T, E extends Exception> void executeForAllPages(final CosmosQueryFunction<String, PageableCollection<T>, E> query,
                                                            final Consumer<PageableCollection<T>> action) throws E, BusyException {
        String continuation = null;
        int wastedAttempts = 0;
        do {
            PageableCollection<T> batch = query.run(continuation);
            if (batch.getSize() == 0) {
                wastedAttempts++;
                if (wastedAttempts > NUMBER_OF_ATTEMPTS_TO_GET_NOT_EMPTY_PAGE) {
                    throw new BusyException(STORAGE_IS_OVERLOADED);
                }
            } else {
                wastedAttempts = 0;
                action.accept(batch);
            }
            continuation = batch.getContinuationToken();
        } while (continuation != null);

    }

    public <T, E extends Exception> PageableCollection<T> getNotEmptyPage(final String continuationToken,
                                                                          final CosmosQueryFunction<String, PageableCollection<T>, E> query) throws E, BusyException {
        String continuation = continuationToken;
        int wastedAttempts = 0;
        PageableCollection<T> batch;
        do {
            batch = query.run(continuation);
            if (batch.getSize() == 0) {
                wastedAttempts++;
                if (wastedAttempts > NUMBER_OF_ATTEMPTS_TO_GET_NOT_EMPTY_PAGE) {
                    throw new BusyException(STORAGE_IS_OVERLOADED);
                }
            }
            continuation = batch.getContinuationToken();
        } while (continuation != null && batch.getSize() == 0);
        return batch;

    }

    public <T, E extends Exception> Collection<T> getAllPages(
            final CosmosQueryFunction<String, PageableCollection<T>, E> query) throws E, BusyException {
        String continuation = null;
        int wastedAttempts = 0;
        Collection<T> all = new LinkedList<>();
        PageableCollection<T> batch;
        do {
            batch = query.run(continuation);
            if (batch.getSize() == 0) {
                wastedAttempts++;
                if (wastedAttempts > NUMBER_OF_ATTEMPTS_TO_GET_NOT_EMPTY_PAGE) {
                    throw new BusyException(STORAGE_IS_OVERLOADED);
                }
            }
            all.addAll(batch);
            continuation = batch.getContinuationToken();
        } while (continuation != null);
        return all;

    }

    @FunctionalInterface
    public interface CosmosQueryFunction<T, R, E extends Exception> {
        R run(T t) throws E;

    }

}
